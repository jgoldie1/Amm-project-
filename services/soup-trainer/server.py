#!/usr/bin/env python3
"""TRYAMM Soup Trainer Service.

Runs on a GPU/self-hosted worker, not on the public web tier. It exposes a small
HTTP API used by lib/ai-training-routes.js and executes Soup with argv lists
(no shell=True). Actual model training occurs only when soup-cli[train] is
installed and the worker has access to the referenced dataset/model.
"""
from __future__ import annotations

import json
import os
import re
import secrets
import subprocess
import threading
import time
from http.server import BaseHTTPRequestHandler, ThreadingHTTPServer
from pathlib import Path
from urllib.parse import urlparse

HOST = os.environ.get("SOUP_WORKER_HOST", "127.0.0.1")
PORT = int(os.environ.get("SOUP_WORKER_PORT", "8787"))
TOKEN = os.environ.get("SOUP_WORKER_API_KEY", "")
ROOT = Path(os.environ.get("SOUP_WORKER_ROOT", "./data/soup-worker")).resolve()
SOUP_BIN = os.environ.get("SOUP_BIN", "soup")
MAX_BODY = 512 * 1024
JOBS: dict[str, dict] = {}
LOCK = threading.Lock()
SAFE_MODEL = re.compile(r"^[A-Za-z0-9._/:-]{1,180}$")
ALLOWED_METHODS = {"sft", "lora", "qlora", "dpo", "grpo", "ppo", "kto", "orpo", "simpo", "ipo", "bco", "distillation", "classification", "pretraining", "raft", "radit"}


def now() -> str:
    return time.strftime("%Y-%m-%dT%H:%M:%SZ", time.gmtime())


def yaml_scalar(value) -> str:
    return json.dumps(value, ensure_ascii=False)


def validate_dataset_source(source: str) -> str:
    source = (source or "").strip()
    if not source or len(source) > 1000:
        raise ValueError("datasetSource is required")
    parsed = urlparse(source)
    if parsed.scheme in {"https", "s3", "gs", "az", "oci"}:
        return source
    path = Path(source).expanduser().resolve()
    allowed_root = Path(os.environ.get("SOUP_DATA_ROOT", "./data")).resolve()
    try:
        path.relative_to(allowed_root)
    except ValueError as exc:
        raise ValueError("local datasetSource must be inside SOUP_DATA_ROOT") from exc
    return str(path)


def method_config(method: str) -> tuple[str, dict]:
    if method == "lora":
        return "sft", {"lora": {"r": 32, "alpha": 16}}
    if method == "qlora":
        return "sft", {"lora": {"r": 32, "alpha": 16}, "quantization": "4bit"}
    return method, {}


def write_config(job_dir: Path, payload: dict) -> Path:
    method = str(payload.get("method", "")).lower()
    if method not in ALLOWED_METHODS:
        raise ValueError("unsupported training method")
    base = str(payload.get("baseModel", "")).strip()
    if not SAFE_MODEL.match(base):
        raise ValueError("invalid baseModel")
    source = validate_dataset_source(str(payload.get("datasetSource", "")))
    task, defaults = method_config(method)
    hp = payload.get("hyperparameters") if isinstance(payload.get("hyperparameters"), dict) else {}
    epochs = max(1, min(20, int(hp.get("epochs", 3))))
    batch = hp.get("batch_size", "auto")
    lr = float(hp.get("lr", 2e-5))
    output = job_dir / "output"
    lines = [
        f"base: {yaml_scalar(base)}",
        f"task: {yaml_scalar(task)}",
        "data:",
        f"  train: {yaml_scalar(source)}",
        "training:",
        f"  epochs: {epochs}",
        f"  lr: {lr}",
        f"  batch_size: {yaml_scalar(batch) if isinstance(batch, str) else batch}",
    ]
    lora = defaults.get("lora")
    if lora:
        lines += ["  lora:", f"    r: {lora['r']}", f"    alpha: {lora['alpha']}"]
    if defaults.get("quantization"):
        lines.append(f"  quantization: {defaults['quantization']}")
    lines.append(f"output: {yaml_scalar(str(output))}")
    config = job_dir / "soup.yaml"
    config.write_text("\n".join(lines) + "\n", encoding="utf-8")
    return config


def run_job(job_id: str, config: Path, job_dir: Path) -> None:
    log_path = job_dir / "train.log"
    with LOCK:
        JOBS[job_id].update(status="TRAINING", startedAt=now(), logPath=str(log_path))
    try:
        with log_path.open("w", encoding="utf-8") as log:
            proc = subprocess.Popen([SOUP_BIN, "train", "--config", str(config)], stdout=log, stderr=subprocess.STDOUT, cwd=str(job_dir), text=True)
            with LOCK:
                JOBS[job_id]["pid"] = proc.pid
            code = proc.wait()
        artifact = job_dir / "output"
        with LOCK:
            JOBS[job_id].update(
                status="SUCCEEDED" if code == 0 else "FAILED",
                exitCode=code,
                completedAt=now(),
                artifactUri=str(artifact) if code == 0 and artifact.exists() else None,
            )
    except Exception as exc:  # worker keeps API alive while recording failure
        with LOCK:
            JOBS[job_id].update(status="FAILED", error=str(exc)[:1000], completedAt=now())


class Handler(BaseHTTPRequestHandler):
    server_version = "TRYAMMSoupTrainer/1.0"

    def _json(self, status: int, payload: dict):
        data = json.dumps(payload).encode("utf-8")
        self.send_response(status)
        self.send_header("Content-Type", "application/json")
        self.send_header("Content-Length", str(len(data)))
        self.end_headers()
        self.wfile.write(data)

    def _authorized(self) -> bool:
        if not TOKEN:
            return self.client_address[0] in {"127.0.0.1", "::1"}
        value = self.headers.get("Authorization", "")
        return secrets.compare_digest(value, f"Bearer {TOKEN}")

    def do_GET(self):
        if self.path == "/health":
            return self._json(200, {"ok": True, "service": "TRYAMM Soup Trainer", "trainer": "soup-cli", "jobs": len(JOBS), "time": now()})
        if not self._authorized():
            return self._json(401, {"error": "unauthorized"})
        if self.path.startswith("/jobs/"):
            job_id = self.path.split("/", 2)[2]
            with LOCK:
                job = JOBS.get(job_id)
            return self._json(200, job) if job else self._json(404, {"error": "job not found"})
        return self._json(404, {"error": "not found"})

    def do_POST(self):
        if not self._authorized():
            return self._json(401, {"error": "unauthorized"})
        if self.path != "/train":
            return self._json(404, {"error": "not found"})
        try:
            length = int(self.headers.get("Content-Length", "0"))
            if length <= 0 or length > MAX_BODY:
                return self._json(413, {"error": "invalid request size"})
            payload = json.loads(self.rfile.read(length))
            external_id = str(payload.get("jobId") or "").strip()
            job_id = external_id if re.match(r"^[A-Za-z0-9_-]{1,180}$", external_id) else f"train_{secrets.token_hex(12)}"
            ROOT.mkdir(parents=True, exist_ok=True)
            job_dir = (ROOT / job_id).resolve()
            job_dir.relative_to(ROOT)
            job_dir.mkdir(parents=True, exist_ok=False)
            config = write_config(job_dir, payload)
            job = {"id": job_id, "status": "QUEUED", "createdAt": now(), "method": payload.get("method"), "baseModel": payload.get("baseModel"), "configPath": str(config)}
            with LOCK:
                JOBS[job_id] = job
            threading.Thread(target=run_job, args=(job_id, config, job_dir), daemon=True).start()
            return self._json(202, {"id": job_id, "status": "QUEUED"})
        except FileExistsError:
            return self._json(409, {"error": "job already exists"})
        except (ValueError, TypeError, json.JSONDecodeError) as exc:
            return self._json(400, {"error": str(exc)})
        except Exception as exc:
            return self._json(500, {"error": str(exc)[:500]})

    def log_message(self, fmt, *args):
        if os.environ.get("SOUP_WORKER_LOG", "1") == "1":
            super().log_message(fmt, *args)


if __name__ == "__main__":
    ROOT.mkdir(parents=True, exist_ok=True)
    print(f"TRYAMM Soup Trainer listening on http://{HOST}:{PORT}")
    ThreadingHTTPServer((HOST, PORT), Handler).serve_forever()

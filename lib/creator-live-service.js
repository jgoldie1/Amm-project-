"use strict";

const BREAK_CAPS_SECONDS = {
  bathroom: 10 * 60,
  accessibility: 30 * 60,
  medical: 30 * 60,
  food_water: 15 * 60,
  technical: 10 * 60,
  emergency: 20 * 60
};

function createCreatorLiveService({ supabase, livekit }) {
  if (!supabase) throw new Error("SUPABASE_REQUIRED");
  if (!livekit) throw new Error("LIVEKIT_SERVICE_REQUIRED");

  async function start({ userId, roomName, displayName }) {
    const room = await livekit.createRoom({ roomName, metadata: JSON.stringify({ userId }) });
    const token = await livekit.createParticipantToken({
      roomName,
      identity: userId,
      name: displayName || userId,
      canPublish: true,
      canSubscribe: true
    });

    const { data, error } = await supabase.from("stream_sessions").insert({
      user_id: userId,
      livekit_room_name: roomName,
      status: "live"
    }).select().single();
    if (error) throw error;

    return { session: data, room, token };
  }

  async function addActiveSeconds({ sessionId, seconds }) {
    const { data: current, error: readError } = await supabase.from("stream_sessions")
      .select("active_seconds,total_seconds,status")
      .eq("id", sessionId).single();
    if (readError) throw readError;
    if (current.status !== "live") throw new Error("STREAM_NOT_LIVE");

    const delta = Math.max(0, Number(seconds || 0));
    const { data, error } = await supabase.from("stream_sessions").update({
      active_seconds: Number(current.active_seconds) + delta,
      total_seconds: Number(current.total_seconds) + delta,
      updated_at: new Date().toISOString()
    }).eq("id", sessionId).select().single();
    if (error) throw error;
    return data;
  }

  async function pause({ sessionId, userId, breakType, requestedSeconds }) {
    const cap = BREAK_CAPS_SECONDS[breakType] ?? BREAK_CAPS_SECONDS.bathroom;
    const requested = Math.max(0, Number(requestedSeconds || 0));
    const protectedSeconds = Math.min(requested, cap);
    const preserves = requested <= cap;

    const { data: session, error: sessionError } = await supabase.from("stream_sessions")
      .select("protected_break_seconds,total_seconds,status")
      .eq("id", sessionId).single();
    if (sessionError) throw sessionError;
    if (session.status !== "live") throw new Error("STREAM_NOT_LIVE");

    const { data: brk, error: breakError } = await supabase.from("stream_breaks").insert({
      stream_session_id: sessionId,
      user_id: userId,
      break_type: breakType,
      requested_seconds: requested,
      protected_seconds: protectedSeconds,
      preserves_session_continuity: preserves
    }).select().single();
    if (breakError) throw breakError;

    const { data: updated, error: updateError } = await supabase.from("stream_sessions").update({
      status: "paused",
      protected_break_seconds: Number(session.protected_break_seconds) + protectedSeconds,
      total_seconds: Number(session.total_seconds) + requested,
      updated_at: new Date().toISOString()
    }).eq("id", sessionId).select().single();
    if (updateError) throw updateError;

    return { session: updated, break: brk };
  }

  async function resume({ sessionId }) {
    const { data, error } = await supabase.from("stream_sessions").update({
      status: "live",
      updated_at: new Date().toISOString()
    }).eq("id", sessionId).eq("status", "paused").select().single();
    if (error) throw error;
    return data;
  }

  async function end({ sessionId, roomName }) {
    const { data, error } = await supabase.from("stream_sessions").update({
      status: "ended",
      ended_at: new Date().toISOString(),
      updated_at: new Date().toISOString()
    }).eq("id", sessionId).select().single();
    if (error) throw error;

    const { error: rpcError } = await supabase.rpc("apply_stream_session_to_creator_progress", {
      p_stream_session_id: sessionId
    });
    if (rpcError) throw rpcError;

    await livekit.closeRoom(roomName).catch(() => null);
    return data;
  }

  async function getProgress(userId) {
    const { data, error } = await supabase.from("creator_progress").select("*").eq("user_id", userId).single();
    if (error) throw error;
    const qualifiedHours = Number(data.qualified_minutes || 0) / 60;
    return {
      ...data,
      qualified_hours: Math.round(qualifiedHours * 100) / 100,
      hours_to_pro: Math.max(0, Math.round((30 - qualifiedHours) * 100) / 100),
      hours_to_elite_review: Math.max(0, Math.round((40 - qualifiedHours) * 100) / 100),
      elite_review_eligible: qualifiedHours >= 40 && data.good_standing && data.engagement_passed && data.fraud_passed
    };
  }

  return { start, addActiveSeconds, pause, resume, end, getProgress };
}

module.exports = { createCreatorLiveService, BREAK_CAPS_SECONDS };

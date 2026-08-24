export default async function handler(req,res){
  res.setHeader('Cache-Control','no-store');
  if(req.method!=='GET')return res.status(405).json({ok:false,error:'Method not allowed'});

  const commitSha=String(
    process.env.VERCEL_GIT_COMMIT_SHA ||
    process.env.GITHUB_SHA ||
    process.env.TRYAMM_RELEASE_SHA ||
    ''
  ).trim();

  const branch=String(
    process.env.VERCEL_GIT_COMMIT_REF ||
    process.env.GITHUB_REF_NAME ||
    'unknown'
  ).trim();

  const deploymentId=String(process.env.VERCEL_DEPLOYMENT_ID||'').trim();
  const environment=String(process.env.VERCEL_ENV||process.env.NODE_ENV||'unknown').trim();

  return res.status(commitSha?200:503).json({
    ok:Boolean(commitSha),
    schema:'tryamm.release.v1',
    app:'amm-omniverse',
    commitSha:commitSha||null,
    branch,
    environment,
    deploymentId:deploymentId||null,
    source:'server-runtime',
    message:commitSha?'Exact deployed source identity is available.':'Deployment SHA is unavailable; release cannot be proven.',
    time:new Date().toISOString(),
  });
}

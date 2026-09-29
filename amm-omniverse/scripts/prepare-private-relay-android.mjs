import fs from 'node:fs'
import path from 'node:path'

if(process.env.TRYAMM_ENABLE_PRIVATE_RELAY!=='true')throw new Error('TRYAMM_ENABLE_PRIVATE_RELAY=true required for VPN candidate generation')

const root=path.resolve('android/app/src/main/java/online/tryamm/app')
fs.mkdirSync(root,{recursive:true})
const pluginPath=path.join(root,'TryammPrivateRelayPlugin.java')
const plugin=`package online.tryamm.app;

import android.app.Activity;
import android.content.Intent;
import android.net.Ikev2VpnProfile;
import android.net.VpnManager;
import android.os.Build;
import androidx.activity.result.ActivityResult;
import com.getcapacitor.JSObject;
import com.getcapacitor.Plugin;
import com.getcapacitor.PluginCall;
import com.getcapacitor.PluginMethod;
import com.getcapacitor.annotation.ActivityCallback;
import com.getcapacitor.annotation.CapacitorPlugin;

@CapacitorPlugin(name = "TryammPrivateRelay")
public class TryammPrivateRelayPlugin extends Plugin {
  private VpnManager manager() {
    if (Build.VERSION.SDK_INT < Build.VERSION_CODES.R) return null;
    return getContext().getSystemService(VpnManager.class);
  }

  private boolean supported(PluginCall call) {
    if (Build.VERSION.SDK_INT < Build.VERSION_CODES.R) {
      call.reject("TRYAMM Private Relay requires Android API 30+");
      return false;
    }
    if (!getContext().getPackageManager().hasSystemFeature("android.software.ipsec_tunnels")) {
      call.reject("IPsec tunnel feature unavailable on this device");
      return false;
    }
    return true;
  }

  @PluginMethod
  public void provisionIkev2(PluginCall call) {
    if (!supported(call)) return;
    String gateway = call.getString("gateway");
    String identity = call.getString("identity");
    String username = call.getString("username");
    String password = call.getString("password");
    if (gateway == null || identity == null || username == null || password == null ||
        gateway.isBlank() || identity.isBlank() || username.isBlank() || password.isBlank()) {
      call.reject("PRIVATE_RELAY_CREDENTIALS_REQUIRED");
      return;
    }

    try {
      Ikev2VpnProfile profile = new Ikev2VpnProfile.Builder(gateway, identity)
        .setAuthUsernamePassword(username, password, null)
        .setBypassable(false)
        .setMetered(false)
        .build();

      Intent consent = manager().provisionVpnProfile(profile);
      if (consent != null) {
        startActivityForResult(call, consent, "vpnConsent");
      } else {
        JSObject result = new JSObject();
        result.put("consentRequired", false);
        result.put("provisioned", true);
        call.resolve(result);
      }
    } catch (Exception error) {
      call.reject("PRIVATE_RELAY_PROVISION_FAILED", error);
    }
  }

  @ActivityCallback
  private void vpnConsent(PluginCall call, ActivityResult result) {
    JSObject data = new JSObject();
    boolean approved = result.getResultCode() == Activity.RESULT_OK;
    data.put("consentRequired", true);
    data.put("provisioned", approved);
    if (approved) call.resolve(data);
    else call.reject("PRIVATE_RELAY_USER_DID_NOT_CONSENT");
  }

  @PluginMethod
  public void start(PluginCall call) {
    if (!supported(call)) return;
    try {
      JSObject data = new JSObject();
      if (Build.VERSION.SDK_INT >= Build.VERSION_CODES.TIRAMISU) {
        String session = manager().startProvisionedVpnProfileSession();
        data.put("session", session);
      } else {
        manager().startProvisionedVpnProfile();
      }
      data.put("started", true);
      call.resolve(data);
    } catch (Exception error) {
      call.reject("PRIVATE_RELAY_START_FAILED", error);
    }
  }

  @PluginMethod
  public void stop(PluginCall call) {
    if (!supported(call)) return;
    try {
      manager().stopProvisionedVpnProfile();
      JSObject data = new JSObject();
      data.put("stopped", true);
      call.resolve(data);
    } catch (Exception error) {
      call.reject("PRIVATE_RELAY_STOP_FAILED", error);
    }
  }

  @PluginMethod
  public void deleteProfile(PluginCall call) {
    if (!supported(call)) return;
    try {
      manager().deleteProvisionedVpnProfile();
      JSObject data = new JSObject();
      data.put("deleted", true);
      call.resolve(data);
    } catch (Exception error) {
      call.reject("PRIVATE_RELAY_DELETE_FAILED", error);
    }
  }

  @PluginMethod
  public void status(PluginCall call) {
    JSObject data = new JSObject();
    if (Build.VERSION.SDK_INT < Build.VERSION_CODES.R) {
      data.put("state", "UNSUPPORTED");
      data.put("provisioned", false);
      call.resolve(data);
      return;
    }
    try {
      if (Build.VERSION.SDK_INT >= Build.VERSION_CODES.TIRAMISU) {
        Object state = manager().getProvisionedVpnProfileState();
        data.put("state", state == null ? "NOT_PROVISIONED" : state.toString());
        data.put("provisioned", state != null);
      } else {
        data.put("state", "PROVISIONED_STATE_REQUIRES_API_33");
        data.put("provisioned", true);
      }
      call.resolve(data);
    } catch (Exception error) {
      data.put("state", "UNAVAILABLE");
      data.put("provisioned", false);
      call.resolve(data);
    }
  }
}
`
fs.writeFileSync(pluginPath,plugin)

const manifestPath=path.resolve('android/app/src/main/AndroidManifest.xml')
let manifest=fs.readFileSync(manifestPath,'utf8')
if(!manifest.includes('android.software.ipsec_tunnels')){
  manifest=manifest.replace(/<manifest([^>]*)>/,m=>`${m}\n    <uses-feature android:name="android.software.ipsec_tunnels" android:required="false" />`)
}
fs.writeFileSync(manifestPath,manifest)

const javaMain=path.resolve('android/app/src/main/java/online/tryamm/app/MainActivity.java')
const kotlinMain=path.resolve('android/app/src/main/java/online/tryamm/app/MainActivity.kt')
if(fs.existsSync(javaMain)){
  let src=fs.readFileSync(javaMain,'utf8')
  if(!src.includes('registerPlugin(TryammPrivateRelayPlugin.class)')){
    if(!src.includes('android.os.Bundle'))src=src.replace('package online.tryamm.app;','package online.tryamm.app;\n\nimport android.os.Bundle;')
    src=src.replace(/public class MainActivity extends BridgeActivity\s*\{\s*\}/m,`public class MainActivity extends BridgeActivity {
  @Override
  public void onCreate(Bundle savedInstanceState) {
    registerPlugin(TryammPrivateRelayPlugin.class);
    super.onCreate(savedInstanceState);
  }
}`)
  }
  fs.writeFileSync(javaMain,src)
}else if(fs.existsSync(kotlinMain)){
  let src=fs.readFileSync(kotlinMain,'utf8')
  if(!src.includes('registerPlugin(TryammPrivateRelayPlugin::class.java)')){
    if(!src.includes('android.os.Bundle'))src=src.replace('package online.tryamm.app','package online.tryamm.app\n\nimport android.os.Bundle')
    src=src.replace(/class MainActivity\s*:\s*BridgeActivity\(\)\s*\{?\s*\}?/m,`class MainActivity : BridgeActivity() {
  override fun onCreate(savedInstanceState: Bundle?) {
    registerPlugin(TryammPrivateRelayPlugin::class.java)
    super.onCreate(savedInstanceState)
  }
}`)
  }
  fs.writeFileSync(kotlinMain,src)
}else{
  throw new Error('Generated MainActivity not found')
}

console.log('TRYAMM Android Private Relay candidate prepared: VpnManager + IKEv2 + system consent + no custom packet interception')

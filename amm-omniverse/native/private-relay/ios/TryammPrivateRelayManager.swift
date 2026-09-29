import Foundation
import NetworkExtension
import Security

public enum TryammPrivateRelayError: Error {
    case invalidConfiguration
    case keychainFailure(OSStatus)
}

public final class TryammPrivateRelayManager {
    public static let shared = TryammPrivateRelayManager()
    private let manager = NEVPNManager.shared()
    private let keychainService = "online.tryamm.private-relay"

    private init() {}

    private func passwordReference(account: String, password: String) throws -> Data {
        let deleteQuery: [String: Any] = [
            kSecClass as String: kSecClassGenericPassword,
            kSecAttrService as String: keychainService,
            kSecAttrAccount as String: account
        ]
        SecItemDelete(deleteQuery as CFDictionary)

        let addQuery: [String: Any] = [
            kSecClass as String: kSecClassGenericPassword,
            kSecAttrService as String: keychainService,
            kSecAttrAccount as String: account,
            kSecValueData as String: Data(password.utf8),
            kSecAttrAccessible as String: kSecAttrAccessibleAfterFirstUnlockThisDeviceOnly,
            kSecReturnPersistentRef as String: true
        ]
        var result: CFTypeRef?
        let status = SecItemAdd(addQuery as CFDictionary, &result)
        guard status == errSecSuccess, let reference = result as? Data else {
            throw TryammPrivateRelayError.keychainFailure(status)
        }
        return reference
    }

    public func provisionIkev2(
        gateway: String,
        remoteIdentifier: String,
        username: String,
        password: String,
        completion: @escaping (Result<Void, Error>) -> Void
    ) {
        guard !gateway.isEmpty, !remoteIdentifier.isEmpty, !username.isEmpty, !password.isEmpty else {
            completion(.failure(TryammPrivateRelayError.invalidConfiguration))
            return
        }

        manager.loadFromPreferences { [weak self] loadError in
            guard let self else { return }
            if let loadError {
                completion(.failure(loadError))
                return
            }

            do {
                let credentialRef = try self.passwordReference(account: username, password: password)
                let ike = NEVPNProtocolIKEv2()
                ike.serverAddress = gateway
                ike.remoteIdentifier = remoteIdentifier
                ike.username = username
                ike.passwordReference = credentialRef
                ike.authenticationMethod = .none
                ike.useExtendedAuthentication = true
                ike.disconnectOnSleep = false

                self.manager.protocolConfiguration = ike
                self.manager.localizedDescription = "TRYAMM Private Relay"
                self.manager.isEnabled = true
                self.manager.saveToPreferences { saveError in
                    if let saveError { completion(.failure(saveError)) }
                    else { completion(.success(())) }
                }
            } catch {
                completion(.failure(error))
            }
        }
    }

    public func start(completion: @escaping (Result<Void, Error>) -> Void) {
        manager.loadFromPreferences { [weak self] error in
            guard let self else { return }
            if let error { completion(.failure(error)); return }
            do {
                try self.manager.connection.startVPNTunnel()
                completion(.success(()))
            } catch {
                completion(.failure(error))
            }
        }
    }

    public func stop() {
        manager.connection.stopVPNTunnel()
    }

    public func status() -> NEVPNStatus {
        manager.connection.status
    }

    public func remove(completion: @escaping (Result<Void, Error>) -> Void) {
        manager.removeFromPreferences { error in
            if let error { completion(.failure(error)) }
            else { completion(.success(())) }
        }
    }
}

export default () => ({
  keyCloakClientSecret: process.env.KEYCLOAK_APP_CLIENT_SECRET,
  keyCloakBaseUrl: process.env.KEYCLOAK_BASE_URL,
  keycloakGrantType: process.env.KEYCLOAK_GRANT_TYPE,
  keycloakScope: process.env.KEYCLOAK_SCOPE,
  keycloakClientId: process.env.KEYCLOAK_APP_CLIENT_ID,
  keycloakRealm: process.env.KEYCLOAK_REALM,
});

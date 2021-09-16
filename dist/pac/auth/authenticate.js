"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.authenticateEnvironment = exports.authenticateAdmin = void 0;
function authenticateAdmin(pac, credentials) {
    return pac("auth", "create", "--kind", "ADMIN", ...addCredentials(credentials));
}
exports.authenticateAdmin = authenticateAdmin;
function authenticateEnvironment(pac, credentials, environmentUrl) {
    return pac("auth", "create", ...addUrl(environmentUrl), ...addCredentials(credentials));
}
exports.authenticateEnvironment = authenticateEnvironment;
function addUrl(url) {
    return ["--url", url];
}
function addCredentials(credentials) {
    return isUsernamePassword(credentials) ? addUsernamePassword(credentials) : addClientCredentials(credentials);
}
function isUsernamePassword(credentials) {
    return "username" in credentials;
}
function addClientCredentials(parameters) {
    return ["--tenant", parameters.tenantId, "--applicationId", parameters.appId, "--clientSecret", parameters.clientSecret];
}
function addUsernamePassword(parameters) {
    return ["--username", parameters.username, "--password", parameters.password];
}

//# sourceMappingURL=authenticate.js.map

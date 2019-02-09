// like a class
const AuthenticationService = {
    authenticated: false,
    authenticate(f) {
        this.authenticated = true;
        setTimeout(f, 100);
    },
    signout(f) {
        this.authenticated = false;
        setTimeout(f, 100);
    }
}

export {AuthenticationService};
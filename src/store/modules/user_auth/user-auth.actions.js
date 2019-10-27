export const AUTH_ACTIONS = {
    LOGGED_IN: 'LOGGED_IN',
    LOGGED_OUT: 'LOGGED_OUT',
    SUPER_USER: 'SUPER_USER'
}

export const actions = {
    LOGGED_IN({commit}) {
        commit(AUTH_ACTIONS.LOGGED_IN);
    },
    LOGGED_OUT({commit}) {
        commit(AUTH_ACTIONS.LOGGED_OUT)
    },
    SUPER_USER({commit}, payload) {
        commit(AUTH_ACTIONS.SUPER_USER, payload)
    }
}
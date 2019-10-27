import {actions} from './user-auth.actions';
import {getters} from './user-auth.getters';
import {mutations} from './user-auth.mutations';

const state = {
    loggedIn: false,
    superUser: false
};

const namespaced = true;

export default {
    namespaced,
    state,
    getters,
    actions,
    mutations
}
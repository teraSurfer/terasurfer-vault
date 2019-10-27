import Vue from 'vue';
import Vuex from 'vuex';
import VuexPersistence from 'vuex-persist';
import authModule from './modules/user_auth';

Vue.use(Vuex);

const vuexLocal = new VuexPersistence({
  storage: window.localStorage
});

export default new Vuex.Store({
  plugins: [vuexLocal.plugin],
  modules: {
    user_auth: authModule
  }
});

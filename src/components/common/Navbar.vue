<template>
    <b-navbar :variant="variant" :class="classes" type="dark" toggleable="lg">
        <b-navbar-brand to="/">
            <h6 class="mb-0"><fa icon="box-open" /> Tera's Vault</h6>
        </b-navbar-brand>
        <b-navbar-toggle target="nav-collapse"></b-navbar-toggle>
        <b-collapse id="nav-collapse" is-nav>
            <b-navbar-nav class="ml-auto">
                <b-nav-item to="/">Home</b-nav-item>
                <b-nav-item v-if="isLoggedIn" to="/dashboard">Dashboard</b-nav-item>
                
                <section>
                    <b-nav-item v-if="!isLoggedIn" to="/login">Login</b-nav-item>
                    <b-nav-item-dropdown v-if="isLoggedIn" :text="firstName" right>
                        <b-dropdown-item v-if="isLoggedIn && isSuperUser" to="/admin">Admin</b-dropdown-item>
                        <b-dropdown-item @click="signOut">Logout</b-dropdown-item>
                    </b-nav-item-dropdown>
                </section>
            </b-navbar-nav>
        </b-collapse>
    </b-navbar>
</template>

<script lang="ts">
import {AmplifyEventBus} from 'aws-amplify-vue';
import swal from 'sweetalert';
export default {
    data: () => ({
        firstName: ''
    }),
    computed: {
        classes() {
           if(this.$route.path !== '/') {
            return 'shadow-sm';
            } else return ''; 
        },
        variant() {
            if(this.$route.path !== '/') {
                return 'primary';
            } else return 'transparent';
        },
        isLoggedIn() {
            return this.$store.getters['user_auth/loggedIn'];
        },
        isSuperUser() {
            this.getFirstName();
            return this.$store.getters['user_auth/superUser'];
        }
    },
    created() {
        document.title = 'Tera\'s Vault';
    },
    async mounted() {
        let self = this;
        AmplifyEventBus.$on('authState', async function(authState) {
            if(authState === 'signedIn') {
                self.$store.dispatch('user_auth/LOGGED_IN')
                const currentSession = await self.$Amplify.Auth.currentSession();
                if(currentSession.idToken.payload['cognito:groups'][0] === 'admin') { 
                    self.$store.dispatch('user_auth/SUPER_USER', true);
                    self.$router.push('/admin');
                } else {
                    self.$store.dispatch('user_auth/SUPER_USER', false);
                    self.$router.push('/dashboard');
                }
            } else if(authState === 'signedOut') {
                self.$store.dispatch('user_auth/LOGGED_OUT');
                self.$router.push('/login')
            }
        });
    },
    methods: {
        signOut: function() {
        this.$Amplify.Auth.signOut()
            .then(() => {
              return AmplifyEventBus.$emit('authState', 'signedOut')
            })
            .catch(e => {
                console.log(e);
                swal('Error', e, 'error')
            });
        },
        async getFirstName() {
            const currentSession = await this.$Amplify.Auth.currentSession();
            console.log(currentSession);
            this.firstName = currentSession.idToken.payload['custom:first_name'];
        }
    }
}
</script>
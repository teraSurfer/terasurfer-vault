<template>
    <b-container class="d-flex justify-content-center mt-4 align-items-center content">
        <amplify-authenticator :authConfig="authConfig"></amplify-authenticator>
    </b-container>
</template>

<script>
import swal from 'sweetalert';
export default {
    data: () => ({
        authConfig: {
            signUpConfig: {
                header: 'Vault - Sign Up',
                hideAllDefaults: true,
                defaultCountryCode: '1',
                signUpFields: [
                    {
                        label: 'Email',
                        key: 'email',
                        required: true,
                        displayOrder: 4,
                        type: 'string',
                        signUpWith: true
                    },
                    {
                        label: 'Password',
                        key: 'password',
                        required: true,
                        displayOrder: 5,
                        type: 'password'
                    },
                    {
                        label: 'First name',
                        key: 'first_name',
                        required: true,
                        displayOrder: 1,
                        type: 'string',
                        custom: true
                    },
                    {
                        label: 'Last name',
                        key: 'last_name',
                        required: true,
                        displayOrder: 2,
                        type: 'string',
                        custom: true
                    },
                    {
                        label: 'Username',
                        key: 'username',
                        required: false,
                        displayOrder: 3,
                        type: 'string',
                        custom: true
                    }
                ]
            },
        },
    }),
    beforeMount() {
        if(this.$route.query.error === '90')
            swal('Sorry', 'You have to login first', 'error');
        if(this.$store.getters['user_auth/loggedIn']) this.$router.push('/');
    }
}
</script>

<style lang="scss">
</style>
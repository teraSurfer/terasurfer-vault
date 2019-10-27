<template>
    <footer>
        <section class="w-100 bg-dark p-4 text-center text-white">
            <b-link href="https://terasurfer.com/projects" target="blank" class="mr-2 text-white">
                <b-img width="130" height="25" src="@/assets/tera.png" alt="terasurfer.com"></b-img>
            </b-link>
            <p class="mb-1 small">
               &copy; {{new Date().getFullYear()}}
            </p>
            <b-link href="https://github.com/terasurfer" target="blank"><fa color="white" :icon="['fab', 'github']" /></b-link>
            <b-link href="" target="blank" class="ml-2"><fa :icon="['fab', 'youtube']" color="white" /></b-link> 
            <b-link href="https://twitter.com/achalaesh" target="blank" class="ml-2"><fa :icon="['fab', 'twitter']" color="white" /></b-link> 
        </section>
    </footer>
</template>
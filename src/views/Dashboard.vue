<template>
    <b-container class="content mt-2 border-0"> 
        <b-card header-bg-variant="accent" class="border-0 shadow-sm" header-class="p-2">
            <template v-slot:header>
                <div class="mb-0 d-flex flex-row w-100 align-items-center">
                    <h5 class="mb-0 text-white">Dashboard</h5>
                    <b-btn size="sm" class="ml-auto" @click="showModal('Upload')" variant="light"><fa icon="plus"/> Add New File</b-btn>
                </div>
            </template>
            <!-- table -->
            <b-table @row-selected="onRowSelect" :items="user.files" responsive="sm" selectable select-mode="single" hover :fields="tableFields">
                <!-- index of the table -->
                <template v-slot:cell(index)="data">
                    {{ data.index + 1 }}
                </template>
            </b-table>
            <!-- upload modal -->
            <b-modal id="upload-modal" class="border-0" no-close-on-backdrop hide-footer title="Create new file">
                <b-form @submit.stop.prevent="uploadFileToS3">
                    <b-form-file
                      v-model="uploadFile"
                      :state="Boolean(uploadFile)"
                      placeholder="Choose a file or drop it here."
                      drop-placeholder="Drop file here."
                    ></b-form-file>
                    <div class="mt-3">Selected file: {{ uploadFile ? uploadFile.name : '' }}</div>
                    
                    <b-form-textarea  v-model="fileDescription" placeholder="Enter file description" max-rows="3"></b-form-textarea>
                    
                    <div class="mt-3 text-center">
                        <b-btn variant="primary" type="submit" size="sm"><fa icon="upload"/> Upload File</b-btn>
                        <b-btn variant="accent" @click="uploadFile = null" class="ml-2" size="sm"><fa icon="ban"/> Reset</b-btn>
                    </div>
                </b-form>
            </b-modal>
            <!-- file description modal -->
            <b-modal id="file-description-modal" class="border-0" no-close-on-backdrop hide-footer title="File Description">
                <h6>Owner: {{dynamoFile.first_name}} {{dynamoFile.last_name}}</h6>
                <h6>Created At: {{new Date(dynamoFile.created_at).toUTCString()}}</h6>
                <h6>Updated At: {{new Date(dynamoFile.updated_at).toUTCString()}}</h6>
                <h6>File Description: {{dynamoFile.fileDescription}}</h6>
                <div class="text-center mt-2">
                    <b-btn variant="outline-primary" @click="downloadFile" class="ml-2"><fa icon="download" /> Download</b-btn>
                    <b-btn variant="outline-accent" @click="updateFile" class="ml-2"><fa icon="pencil-alt" /> Update</b-btn>
                    <b-btn variant="outline-dark" @click="deleteFile" class="ml-2"><fa icon="trash" /> Delete</b-btn>
                </div>
            </b-modal>

            <!-- file update modal -->
            <b-modal id="file-update-modal" class="border-0" no-close-on-backdrop hide-footer title="Update File">
                <b-form @submit.stop.prevent="updateFileInS3">
                    <b-form-file
                      v-model="uploadFile"
                      :state="Boolean(uploadFile)"
                      placeholder="Choose a file or drop it here."
                      drop-placeholder="Drop file here."
                    ></b-form-file>
                    <div class="mt-3">Selected file: {{ uploadFile ? uploadFile.name : '' }}</div>
                    
                    <b-form-textarea  v-model="dynamoFile.fileDescription" max-rows="3"></b-form-textarea>
                    
                    <div class="mt-3 text-center">
                        <b-btn variant="primary" type="submit" size="sm"><fa icon="upload"/> Upload File</b-btn>
                        <b-btn variant="accent" @click="uploadFile = null" class="ml-2" size="sm"><fa icon="ban"/> Reset</b-btn>
                    </div>
                </b-form>
            </b-modal>
        </b-card>
    </b-container>
</template>

<script>
import swal from 'sweetalert';
export default {
    data: () => ({
        uploadFile: null,
        fileDescription: '',
        user: {
            first_name: '',
            last_name: '',
            CognitoUserId: '',
            files: [],
            dynamoFiles: []
        },
        tableFields: [
            {key: 'index', label: 'S.no'},
            {key: 'key', label: 'File Name'},
            {key: 'lastModified', label: 'Last Modified'},
            {key: 'size', label: 'Size'}
        ],
        modalLoading: true,
        dynamoFile: {}
    }),
    methods: {
        showModal(modalType) {
            switch(modalType) {
                case 'Upload': 
                    this.$bvModal.show('upload-modal')
                    break;
                case 'File Description':
                    this.$bvModal.show('file-description-modal')
                    break;
                case 'Update':
                    this.$bvModal.show('file-update-modal')
                    break;
            }
        },
        async uploadFileToS3() {
            if(this.uploadFile !== null) {
                try {
                    const name = this.uploadFile.name.replace('~', '');
                    const fileKeyUrl = `${this.user.CognitoUserId}/${name}`;
                    const s3response = 
                        await this.$Amplify.Storage.put(fileKeyUrl, this.uploadFile);
                    if(s3response.key === fileKeyUrl) {
                        const apiName = 'vaultAPI';
                        const apiPath = '/s3-files';
                        const dynamoResponse = 
                            await this.$Amplify.API.put(apiName, apiPath, {
                                body: {
                                    CognitoUserId: this.user.CognitoUserId+'~'+s3response.key.split('/')[1],
                                    first_name: this.user.first_name,
                                    last_name: this.user.last_name,
                                    created_at: new Date(),
                                    updated_at: new Date(),
                                    fileKeyUrl: s3response.key,
                                    fileName: s3response.key.split('/')[1],
                                    fileDescription: this.fileDescription
                                }
                            });
                            if(dynamoResponse.success) {
                                this.$bvModal.hide('upload-modal');
                                this.uploadFile = null;
                                this.fileDescription = '';
                                swal('Uploaded Successfully', 'Your file was uploaded successfully', 'success');
                                this.getFiles();
                            } else {
                                console.log(dynamoResponse.error);
                                swal('Error', 'Something went wrong. Try again later.', 'error');
                            }
                    }
                } catch (err) {
                    swal('Error', err.message, 'error');
                }
            } else {
                swal('File Can\'t be empty', 'You can\'t upload nothing', 'warning');
            }
        },
        async getFiles() {
            const files = await this.$Amplify.Storage.list(this.user.CognitoUserId);
            this.user.files = files.map(file => {
                file.key = file.key.split('/')[1];
                file.size = Math.ceil(file.size/1024, ) + ' KB';
                file.lastModified = new Date(file.lastModified).toUTCString();
                return file;
            });
        },
        onRowSelect(item) {
            const selectedRow = item[0]; 
            this.loadDynamoFile(selectedRow.key);
            this.showModal('File Description');
        },
        async loadDynamoFile(key) {
            const apiName = 'vaultAPI';
            const apiPath = `/s3-files/object/${this.user.CognitoUserId}~${key}`;
            const response = await this.$Amplify.API.get(apiName, apiPath);
            this.dynamoFile = response;
            console.log(this.dynamoFile);
        },
        async downloadFile() {
            const response = await this.$Amplify.Storage.get(this.dynamoFile.fileKeyUrl);
            console.log(response);
            window.location.href = response;
        },
        async deleteFile() {
            swal({
                  title: "Are you sure?",
                  text: "Once deleted, you will not be able to recover this file!",
                  icon: "warning",
                  buttons: true,
                  dangerMode: true,
            }).then(async (willDelete) => {
                if (willDelete) {
                    const response = await this.$Amplify.Storage.remove(this.dynamoFile.fileKeyUrl);
                    console.log(response);
                    const apiName = 'vaultAPI';
                    const apiPath = `/s3-files/object/${this.dynamoFile.CognitoUserId}`;
                    const dyDel = await this.$Amplify.API.del(apiName, apiPath);
                    console.log(dyDel);
                    this.getFiles();
                    this.$bvModal.hide('file-description-modal');
                    swal("Poof! Your file has been deleted!", {
                      icon: "success",
                    });
                } else {
                  swal("Your file is safe!");
                }
            });
        },
        updateFile() {
            this.$bvModal.hide('file-description-modal');
            this.showModal('Update');
        },

        async updateFileInS3() {
            // update in s3
            const s3update = await this.$Amplify.Storage.put(this.dynamoFile.fileKeyUrl, this.uploadFile);
            console.log(s3update);
            const apiName = 'vaultAPI';
            const apiPath = `/s3-files`;
            const init = {
                body: {
                    CognitoUserId: this.dynamoFile.CognitoUserId,
                    created_at: this.dynamoFile.created_at,
                    first_name: this.dynamoFile.first_name,
                    last_name: this.dynamoFile.last_name,
                    fileName: this.dynamoFile.fileName,
                    fileDescription: this.dynamoFile.fileDescription,
                    updated_at: new Date(),
                    fileKeyUrl: this.dynamoFile.fileKeyUrl
                }
            };
            const dyUpdate = await this.$Amplify.API.post(
                apiName,
                apiPath,
                init
            );
            if(dyUpdate.success) {
                this.$bvModal.hide('file-update-modal');
                this.uploadFile = null;
                this.fileDescription = '';
                swal('Updated Successfully', 'Your file was updated successfully', 'success');
                this.getFiles();
            } else {
                 console.log(dyUpdate.error);
                 swal('Error', 'Something went wrong. Try again later.', 'error');
            }
        }
    },
    async mounted() {
        const currentSession = await this.$Amplify.Auth.currentSession();
        this.user.first_name = currentSession.idToken.payload['custom:first_name'];
        this.user.last_name = currentSession.idToken.payload['custom:last_name'];
        this.user.CognitoUserId = currentSession.idToken.payload.sub;
        this.getFiles();
    }
}
</script>

<style lang="scss">
.modal-header {
    border: 0;
}
</style>
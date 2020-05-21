import React from 'react';
import {Grid, Header, Icon, Dropdown,Image, Modal, Input, Button} from 'semantic-ui-react';
import firebase from '../../firebase';
import AvatarEditor from 'react-avatar-editor';

class UserPanel extends React.Component{
    state={
        user: this.props.currentUser,
        modal: false,
        previewImage: '',
        uploadedCroppedImage: '',
        croppedImage: '',
        blob: '',           //necessary for sending image to firebase storage
        storageRef: firebase.storage().ref(),
        userRef: firebase.auth().currentUser,
        usersRef: firebase.database().ref('users'),
        metadata:{
            contentType: 'image/jpeg'
        }
    }

    openModal = () => this.setState({modal: true});
    closeModal = () => this.setState({modal: false});


    dropdownOptions=()=>[
        {
            key:'user',
            text: <span>Signed in as <strong>{this.state.user.displayName}</strong></span>,
            disabled: true
        },
        {
            key:'avatar',
            text: <span onClick={this.openModal}>Change Avatar</span>
        },
        { 
            key:'signout',
            text:<span onClick={this.handleSignOut}>Sign Out</span>
        },
    ];

    handleChange = event =>{
        const file =event.target.files[0];
        const reader= new FileReader();
        if(file){
            reader.readAsDataURL(file);
            reader.addEventListener('load', ()=>{
                this.setState({ previewImage : reader.result});
            })
        }
    }

    handleCropImage = () =>{
        if(this.avatarEditor){
            this.avatarEditor.getImageScaledToCanvas().toBlob(blob=>{       //getImageScaledToCanvas does cropping of image
                let imageUrl= URL.createObjectURL(blob);
                this.setState({
                    croppedImage : imageUrl,
                    blob 
                });
            });                                 
        }
    }

    handleSignOut=()=>{
        firebase
            .auth()
            .signOut()
            .then(()=>{
                console.log('Signed out :)')
            })
    }

    uploadCroppedImage = () =>{
        const {storageRef,userRef, blob, metadata}= this.state;

        storageRef
            .child(`avatar/user/${userRef.uid}`) //user's uid
            .put(blob, metadata)
            .then(snap =>{
                snap.ref.getDownloadURL().then(downloadURL =>{
                    this.setState({ uploadedCroppedImage :downloadURL }, ()=>this.changeAvatar())
                })
            })
    }

    changeAvatar = () =>{
        this.state.userRef
            .updateProfile({
                photoURL: this.state.uploadedCroppedImage
            })
            .then(()=>{
                console.log('photoURL updated');
                this.closeModal();
            })
            .catch(err =>{
                console.error(err);
            })

        this.state.usersRef
            .child(this.state.user.uid)
            .update({avatar: this.state.uploadedCroppedImage})
            .then(()=>{
                console.log('User Avatar Updated');
            })
            .catch(err =>{
                console.error(err);
            })
    }

    render(){
        const {user, modal,previewImage,croppedImage} = this.state;
        const{ primaryColor}= this.props;
        return(
            <Grid style={{background: primaryColor}}>
                <Grid.Column>
                    <Grid.Row style={{padding:'1.2em', margin: 0}}>
                        {/*App header */}
                        <Header inverted floated="left" as="h2">
                            <Icon name="code" />
                            <Header.Content>GaxChat</Header.Content>
                        </Header> 

                    {/*User Dropdown */}
                    <Header inverted as="h4" style={{padding:'0.25em'}}>
                        <Dropdown trigger={
                            <span>
                                <Image src={user.photoURL} spaced="right" avatar/>
                                {user.displayName}
                            </span>
                        } options={this.dropdownOptions()}/>
                    </Header>
                    </Grid.Row>
                    {/* Change User avatar modal */}
                    <Modal basic open={modal} onClose={this.closeModal}>
                        <Modal.Header>Change Avatar</Modal.Header>
                        <Modal.Content>
                            <Input
                                onChange={this.handleChange}
                                fluid
                                type="file"
                                label="New Avatar"
                                name="previewImage"
                            />
                            <Grid centered stackable columns={2}>
                                <Grid.Row centered>
                                    <Grid.Column className="ui center aligned grid"> {/*Semantic-ui class */}
                                        {/* Image Preview */}
                                        {previewImage && (
                                            <AvatarEditor 
                                                ref={node =>(this.avatarEditor = node)}
                                                image={previewImage}
                                                height={120}
                                                width={120}
                                                border={50}
                                                scale={1.1}
                                            />
                                        )}
                                    </Grid.Column>
                                    <Grid.Column>
                                        {/* Cropped Image Preview */}
                                        {croppedImage && (
                                            <Image 
                                                style={{ margin : '3.5em auto'}}
                                                width={100}
                                                height={100}
                                                src={croppedImage}
                                            />
                                        )}
                                    </Grid.Column>
                                </Grid.Row>
                            </Grid>
                        </Modal.Content>
                        <Modal.Actions>
                            {croppedImage && <Button color="green" onClick={this.uploadCroppedImage}>
                                <Icon name="save"/> Change Avatar
                            </Button>}

                            <Button color="green" onClick={this.handleCropImage}>
                                <Icon name="image"/> Preview
                            </Button>

                            <Button color="red" onClick={this.closeModal}>
                                <Icon name="remove"/> Cancel
                            </Button>
                        </Modal.Actions>
                    </Modal>
                </Grid.Column>
            </Grid>
        )
    }
}

export default UserPanel;
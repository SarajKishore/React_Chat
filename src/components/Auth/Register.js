import React from 'react';
import {Grid,Form,Segment,Button,Header,Message,Icon} from 'semantic-ui-react';
import {Link} from 'react-router-dom';
import firebase from '../../firebase';
import md5 from 'md5';

class Register extends React.Component{
    state= {
        username:'',
        email:'',
        password:'',
        passwordConfirmation:"",
        errors:[],
        loading: false,
        userRef: firebase.database().ref('users'),
    }
    isFormValid= () =>{
        let errors=[];
        let error;


        if(this.isFormEmpty(this.state)){
            error= {message: 'Fill all the fields'}
            this.setState({errors:errors.concat(error)});
            return false;
        } else if(!this.isPasswordValid(this.state)){
            error= {message: 'Invalid Password'}
            this.setState({errors:errors.concat(error)});
            return false;

        }else{
            return true;
        }
    }

    isFormEmpty= ({username,email,password,passwordConfirmation})=>{
        return !username.length || !email.length || !password.length || !passwordConfirmation.length;
    }

    isPasswordValid=({password,passwordConfirmation})=>{
        if(password.length<6 || passwordConfirmation.length<6){
            return false;
        }else if(password !== passwordConfirmation){
            return false;
        }else{
            return true;
        }
    }

displayErrors=errors => errors.map((error,i)=><p key={i}>{error.message}</p>)

    handleChange= event =>{
        this.setState({ [event.target.name]: event.target.value})
    }

    handleSubmit= event =>{
        event.preventDefault();  // Prevents reloading of page
        if(this.isFormValid()){
            this.setState({errors:[], loading: true})
            firebase
                .auth()                         //for use of authorization tools
                .createUserWithEmailAndPassword(this.state.email, this.state.password)       //to register user
                .then(createdUser =>{
                    console.log(createdUser);
                    createdUser.user.updateProfile({
                        displayName:this.state.username,
                        photoURL:`http://gravatar.com/avatar/${md5(createdUser.user.email)}?d=identicon`
                    })
                    .then(()=>{
                        this.saveUser(createdUser).then(()=>{
                            console.log("User Saved")
                        })
                    })
                    .catch(err=>{
                        console.error(err);
                        this.setState({errors: this.state.errors.concat(err),loading:false});
                    })
                })
                .catch(err=>{
                    console.error(err);
                    this.setState({errors: this.state.errors.concat(err),loading:false});
                })
        }
    }

    saveUser= createdUser =>{
         return this.state.userRef.child(createdUser.user.uid).set({
             name: createdUser.user.displayName,
             avatar: createdUser.user.photoURL
         })
    }

    handleInputError = (errors,inputName) =>{
        return errors.some(error=>error.message.toLowerCase().includes(inputName))? 'error' : ''  //to make a class of a input field in error type
    }

    render(){
        const {username, email, password, passwordConfirmation, errors,loading}= this.state;    //Destructuring
        return(
           <Grid textAlign="center" verticalAlign="middle" className="app">
               <Grid.Column style={{maxWidth :450}}>
                   <Header as="h1" icon color="orange" textAlign="center">
                       <Icon name="puzzle piece" color="orange"/>
                        Register to GaxChat
                   </Header>
                   <Form onSubmit={this.handleSubmit} size="large">
                       <Segment stacked>
                           <Form.Input fluid name="username" icon="user" iconPosition="left" placeholder="Username" onChange={this.handleChange} value={username}  type="text" />     
                           <Form.Input fluid name="email" icon="mail" iconPosition="left" placeholder="Email Address" onChange={this.handleChange} value={email} className={this.handleInputError(errors,'email')} type="email"/>
                           <Form.Input fluid name="password" icon="lock" iconPosition="left" placeholder="Password" value={password} onChange={this.handleChange} className={this.handleInputError(errors,'password')} type="password"/>
                           <Form.Input fluid name="passwordConfirmation" icon="repeat" iconPosition="left" placeholder="Password Confirmation" value={passwordConfirmation} onChange={this.handleChange} className={this.handleInputError(errors,'password')} type="password"/>
                           <Button color="orange" disabled={loading} className={loading ? 'loading': ''} fluid size="large">Submit</Button>
                       </Segment>
                   </Form>
                   {errors.length >0 && (
                       <Message error>
                           <h3>Error</h3>
                           {this.displayErrors(errors)}
                       </Message>
                   )}
                   <Message>Already a user ? <Link to="/login">Login</Link></Message>
               </Grid.Column>
           </Grid>
        )
    }
}

export default Register;
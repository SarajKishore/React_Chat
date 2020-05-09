import React from 'react';
import {Grid,Form,Segment,Button,Header,Message,Icon} from 'semantic-ui-react';
import {Link} from 'react-router-dom';
import firebase from '../../firebase';

class Login extends React.Component{
    state= {
        email:'',
        password:'',
        errors:[],
        loading: false,
    }


displayErrors=errors => errors.map((error,i)=><p key={i}>{error.message}</p>)

    handleChange= event =>{
        this.setState({ [event.target.name]: event.target.value})
    }

    handleSubmit= event =>{
        event.preventDefault();  // Prevents reloading of page
        if(this.isFormValid(this.state)){
            this.setState({errors:[], loading: true})
            firebase
                .auth()
                .signInWithEmailAndPassword(this.state.email, this.state.password)
                .then(signedUser=>{
                   // console.log(signedUser);
                })
                .catch(err =>{
                    console.error(err);
                    this.setState({
                        errors : this.state.errors.concat(err),
                        loading: false,

                    });
                })
        }
    }

    isFormValid=({email, password})=>email && password;

    handleInputError = (errors,inputName) =>{
        return errors.some(error=>error.message.toLowerCase().includes(inputName))? 'error' : ''  //to make a class of a input field in error type
    }

    render(){
        const {email, password,errors,loading}= this.state;    //Destructuring
        return(
           <Grid textAlign="center" verticalAlign="middle" className="app">
               <Grid.Column style={{maxWidth :450}}>
                   <Header as="h1" icon color="violet" textAlign="center">
                       <Icon name="code branch" color="violet"/>
                        Login to GaxChat
                   </Header>
                   <Form onSubmit={this.handleSubmit} size="large">
                       <Segment stacked>
                           <Form.Input fluid name="email" icon="mail" iconPosition="left" placeholder="Email Address" onChange={this.handleChange} value={email} className={this.handleInputError(errors,'email')} type="email"/>
                           <Form.Input fluid name="password" icon="lock" iconPosition="left" placeholder="Password" value={password} onChange={this.handleChange} className={this.handleInputError(errors,'password')} type="password"/>
                           <Button color="violet" disabled={loading} className={loading ? 'loading': ''} fluid size="large">Submit</Button>
                       </Segment>
                   </Form>
                   {errors.length >0 && (
                       <Message error>
                           <h3>Error</h3>
                           {this.displayErrors(errors)}
                       </Message>
                   )}
                   <Message>Don't have an Account ? <Link to="/register">Register</Link></Message>
               </Grid.Column>
           </Grid>
        )
    }
}

export default Login;
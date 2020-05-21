import React from 'react';
import {Sidebar, Divider, Button, Menu, Modal, Icon, Label,Segment} from 'semantic-ui-react';
import { CirclePicker } from 'react-color';
import { connect } from 'react-redux';
import firebase from '../../firebase';
import {setColors} from '../../actions';

class ColorPanel extends React.Component{
    state= {
        user:this.props.currentUser,
        modal: false,
        primary: "#eee",
        secondary: "#4c3c4c",
        userRef: firebase.database().ref('users'),
        userColors:[]
    };

    componentDidMount(){
        if(this.state.user){
            this.addListener(this.state.user.uid);
        }
    }

    componentWillUnmount(){
        this.removeListener();
    }

    removeListener = () =>{
        this.state.userRef.child(`${this.state.user.uid}/colors`).off();
    }

    addListener= userId =>{
        let userColors=[];
        this.state.userRef
        .child(`${userId}/colors`)
        .on('child_added', snap=>{
            userColors.unshift(snap.val());     // unshift puts value at the begining of the array
            console.log(userColors); 
            this.setState({userColors}); 
        })
    }

    handleChangePrimary = color =>this.setState({
        primary: color.hex,
    });
    
    handleChangeSecondary = color =>this.setState({
        secondary: color.hex,
    });

    handleSaveColors =()=>{
        if(this.state.primary && this.state.secondary){ //To check whether primary and secondary state has value
            this.SaveColors(this.state.primary, this.state.secondary);
        }
    }

    SaveColors = (primary, secondary)=>{
        this.state.userRef
            .child(`${this.state.user.uid}/colors`)
            .push()
            .update({
                primary,
                secondary
            })
            .then(()=>{
                console.log('Color added');
                this.closeModal();
            })
            .catch(err => console.error(err))
    }

    displayUserColors = colors =>(                                              // use brackets for using components inside a function
        colors.length>0 && colors.map((color,i)=>(
            <React.Fragment key={i}>
                <Divider />
                <div 
                    className="color__container"
                    onClick={()=>{this.props.setColors(color.primary,color.secondary)}}
                >
                    <div className="color__square" style={{background: color.primary}}>
                        <div className="color__overlay" style={{background: color.secondary}}>
                        
                        </div>
                    </div>
                </div>
            </React.Fragment>
        ))
    )

    openModal=()=>this.setState({modal: true});
    closeModal=()=>this.setState({modal: false}); 

    render(){
        const{modal,primary,secondary, userColors}= this.state;
        return(
            <Sidebar
                    as={Menu}
                    icon="labeled"
                    vertical
                    inverted
                    visible
                    width="very thin"    
                >
                    <Divider/>
                    <Button icon="add" size="small" color="blue" onClick={this.openModal}/>
                    {this.displayUserColors(userColors)}

                    {/*Color Picker Modal */}
                    <Modal basic open={modal} onClose={this.closeModal}>
                        <Modal.Header>Choose App Colors</Modal.Header>
                            <Modal.Content>
                                <Segment inverted>    {/*inverted so we can see the text in Label*/}
                                    <Label content="Primary Colors"/>
                                    <CirclePicker colors={ ["#f44336", "#e91e63", "#9c27b0", "#673ab7", "#3f51b5", "#2196f3", "#03a9f4", "#00bcd4", "#009688", "#4caf50", "#8bc34a", "#cddc39", "#ffeb3b", "#ffc107", "#ff9800", "#ff5722", "#795548", "#000000"]} color={primary} onChange={this.handleChangePrimary}/>
                                </Segment>

                                <Segment inverted >
                                    <Label content="Secondary Color"/>
                                    <CirclePicker colors={ ["#f44336", "#e91e63", "#9c27b0", "#673ab7", "#3f51b5", "#2196f3", "#03a9f4", "#00bcd4", "#009688", "#4caf50", "#8bc34a", "#cddc39", "#ffeb3b", "#ffc107", "#ff9800", "#ff5722", "#795548", "#000000"]} color={secondary} onChange={this.handleChangeSecondary}r/>
                                </Segment>
                            </Modal.Content>
                        <Modal.Actions>
                            <Button color="green" inverted onClick={this.handleSaveColors}>
                                <Icon name="checkmark"/> Save Colors
                            </Button>

                            <Button color="red" inverted>
                                <Icon name="remove" onClick={this.closeModal}/> Cancel
                            </Button>
                        </Modal.Actions>
                    </Modal>
                </Sidebar>
        );
    }
}
export default connect(null ,{setColors})(ColorPanel);
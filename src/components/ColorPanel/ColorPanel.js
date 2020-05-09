import React from 'react';
import {Sidebar, Divider, Button, Menu} from 'semantic-ui-react';

class ColorPanel extends React.Component{
    render(){
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
                    <Button icon="add" size="small" color="blue"/>
                </Sidebar>
        );
    }
}
export default ColorPanel;
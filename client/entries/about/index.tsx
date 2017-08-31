import * as React from 'react'
import * as ReactDOM from "react-dom"

declare var require: any;

class About extends React.Component {
    render() {
        return <button onClick={this.gotoSubmit}> 我们来自...</button>;
    }

    gotoSubmit = () => {
        require.ensure([], () =>{
            const Submit = require('../../pages/submit/index.tsx');
            console.log(Submit);
        }, 'submit');
    }

    componentDidMount() {
        document.title = '介绍';
    }
}

ReactDOM.render(
    <About></About>,
    document.getElementById("root")
)
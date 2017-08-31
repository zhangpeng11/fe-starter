import * as React from 'react'
import * as ReactDOM from "react-dom"

class Home extends React.Component {
    render() {
        return <h1> Hello World </h1>;
    }

    componentDidMount() {
        document.title = '神來之手';
    }
}

ReactDOM.render(
    <Home></Home>,
    document.getElementById("root")
);

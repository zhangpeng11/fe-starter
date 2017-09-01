import * as React from 'react'
import * as ReactDOM from "react-dom"
import router from '../../router'

class About extends React.Component {
    render() {
        return <button onClick={this.gotoSubmit}> 我们来自...</button>;
    }

    gotoSubmit = () => {
        router.push('/submit')
    }

    componentDidMount() {
        document.title = '介绍';
    }
}

ReactDOM.render(
    <About></About>,
    document.getElementById("root")
)

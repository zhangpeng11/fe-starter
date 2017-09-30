import * as React from 'react'
import router from '../../router'

export default class Home extends React.Component {
    render() {
        return <div>
            <h1 id="home-title"> Hello World by Home Page </h1>
            <button onClick={() => {this.gotoUnknown()}}> push to unknown </button>
            <button onClick={() => {this.replaceUnknown()}}> replaceUnknown to unknown </button>
        </div>;
    }

    gotoUnknown() {
        router.push('/unknown')
    }

    replaceUnknown() {
        router.push('/unknown')
    }

    componentDidMount() {
        document.title = '神來之手';
    }
}

import * as React from 'react'
import router from '../../router'

export default class Submit extends React.Component {
    render() {
        return <div>
            <h1> Submit Page </h1>
            <button onClick={() => this.gotoHome()}> push to home </button>
            <button onClick={() => this.replaceHome()}> replace to home </button>
        </div>;
    }

    componentDidMount() {
        document.title = '提交~';
    }

    gotoHome() {
        router.push('/');
    }

    replaceHome() {
        router.replace('/');
    }
}

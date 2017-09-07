import * as React from 'react'
import router from '../../router'

export default class Submit extends React.Component {
    render() {
        return <div>
            <input/>
            <button onClick={() => this.gotoHome()}> push to home </button>
            <button onClick={() => this.replaceHome}> replace to home </button>
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

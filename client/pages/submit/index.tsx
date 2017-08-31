import * as React from 'react'

export default class Submit extends React.Component {
    render() {
        return <input/>;
    }

    componentDidMount() {
        document.title = '提交~';
    }
}
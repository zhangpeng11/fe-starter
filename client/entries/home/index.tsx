import * as React from 'react'

export default class Home extends React.Component {
    render() {
        return <h1> Hello World by Home Page </h1>;
    }

    componentDidMount() {
        document.title = '神來之手';
    }
}

import React, { Component } from 'react';
import logo from '../assets/logo.jpg';
import { Link } from 'react-router-dom';

class App extends Component {
    constructor(props) {
        super(props);
        this.state = {
            walletInfo: {
                address: 'fooxv6',
                balance: 9999
            }
        }
    }

    componentDidMount() {
        fetch(`${document.location.origin}/api/wallet-info`)
            .then(response => response.json())
            .then(json => this.setState({ walletInfo: json }))
    }

    render() {
        const { address, balance } = this.state.walletInfo

        return (
            <div className="App">
                <img className='logo' src={logo}></img>
                <br/>
                <br/>
                <div>
                    Welcome to the blockchain 
                </div>
                <br/>
                <div><Link to='/blocks'>Blocks</Link></div>
                <div><Link to='/conduct-transaction'>Conduct a Transaction</Link></div>
                <div><Link to='/transaction-pool'>Transaction Pool</Link></div>
                <br/>
                <div className="WalletInfo">
                    <div>Address: {address}</div>
                    <div>Balance: {balance}</div>
                    <br/>
                </div>
            </div>
        )
    }   
}

export default App;
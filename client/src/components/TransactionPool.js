import React, { Component } from 'react';
import { Link } from 'react-router-dom';
import Transaction from './Transaction';
import { Button } from 'react-bootstrap';
import history from '../history';

const POLL_INTERVAL_MS = 10000

class TransactionPool extends Component {
    constructor(props) {
        super(props)
        this.state = {
            transactionPoolMap: {}
        };
    }

    fetchTransactionPoolMap = () => {
        fetch(`${document.location.origin}/api/transaction-pool-map`)
            .then(response => response.json())
            .then(json => { 
                this.setState({ transactionPoolMap: json.transactionMap })
            })
    }

    fetchMineTransactions = () => {
        fetch(`${document.location.origin}/api/mine-transactions`)
            .then(response => {
                if (response.status == 200) {
                    alert('success');
                    history.push('/blocks')
                } else {
                    alert('The mine-transactions block request did not completet')
                }
            })
    }
    componentDidMount() {
        this.fetchTransactionPoolMap();

        this.fetchPoolMapInterval = setInterval(
            () => this.fetchTransactionPoolMap(),
            POLL_INTERVAL_MS
        )
    }

    componentWillUnmount() {
        clearInterval(this.fetchPoolMapInterval)
    }

    render() {
        return (
            <div className='TransactionPool'>
                <div><Link to='/'>Home</Link></div>
                <h3>Transaction Pool</h3>
                {
                    Object.values(this.state.transactionPoolMap).map(transaction => {
                        return (
                            <div key={transaction.id}>
                                <hr/>
                                <Transaction transaction={transaction} />
                            </div>
                        )
                    })
                }
                <hr/>
                <Button
                    bsStyle="danger"
                    onClick={this.fetchMineTransactions}
                >
                    Mine the Transactions
                </Button>
            </div>
        )
    }
}

export default TransactionPool;
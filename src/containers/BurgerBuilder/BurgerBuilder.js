import React, { Component } from 'react';
import Aux from '../../hoc/Aux/Aux';
import Burger from '../../components/Burger/Burger';
import BuildControls from '../../components/Burger/BuildControls/BuildControls';
import Modal from '../../components/UI/Modal/Modal';
import OrderSummary from '../../components/Burger/OrderSummary/OrderSummary';
import axios from '../../axios-orders';
import Spinner from '../../components/UI/Spinner/Spinner';
import withErrorHandler from '../../hoc/withErrorHandler/withErrorHandler';

const INGREDIENT_PRICES = {
    salad: 0.6,
    meat: 3,
    bacon: 0.7,
    cheese: 0.5
};

class BurgerBuilder extends Component {

    state = {
        ingredients: {
            salad: 1,
            bacon: 1,
            cheese: 1,
            meat: 1
        },
        totalPrice: 0,
        purchasable: true,
        purchasing: false,
        loading: false,
    };

    componentDidMount() {
        const newPrice = this.calculateInitialPrice();
        this.setState({ totalPrice: newPrice });
    }

    // needs to be arrow function as it is passed as a prop
    updatePurchasing = () => {
        this.setState({ purchasing: true });
    }

    purchaseCancelHandler = () => {
        this.setState({ purchasing: false });
    }

    purchaseContinueHandler = () => {
        this.setState({ loading: true });
        const order = {
            ingredients: this.state.ingredients,
            price: this.state.totalPrice,
            customer: {
                name: 'Matt Customer',
                address: {
                    street: 'Test street 1',
                    zipCode: '10179',
                    town: 'Berlin',
                    country: 'Germany'
                }
            }
        };
        axios.post('/orders.json', order)
            .then(response => {
                this.setState({loading: false, purchasing: false});
            })
            .catch(error => {
                this.setState({loading: false, purchasing: false });
            });
    }

    updatePurchaseState(ingredients) {
        const sum = Object.keys(ingredients)
            .map(iKey => {
                return ingredients[iKey];
            })
            .reduce((sum, el) => {
                return sum + el;
            }, 0);

        this.setState({ purchasable: sum > 0 });
    }

    calculateInitialPrice() {
        let price = 0;
        Object.keys(this.state.ingredients).forEach(i => {
            price += this.state.ingredients[i] * INGREDIENT_PRICES[i];
        });
        return price;
    }

    addIngredient = (type) => {

        // update state in immutable way
        const oldCount = this.state.ingredients[type];
        const updatedIngredients = {
            ...this.state.ingredients
        };
        updatedIngredients[type] = oldCount + 1;

        const newPrice = INGREDIENT_PRICES[type] + this.state.totalPrice;
        this.setState({ ingredients: updatedIngredients, totalPrice: newPrice });
        this.updatePurchaseState(updatedIngredients);
    };

    removeIngredient = (type) => {

        const oldCount = this.state.ingredients[type];
        const oldPrice = this.state.totalPrice;
        const updatedIngredients = {
            ...this.state.ingredients
        };

        if (oldCount >= 1) {
            updatedIngredients[type] = oldCount - 1;
            const newPrice = oldPrice - INGREDIENT_PRICES[type];
            this.setState({ ingredients: updatedIngredients, totalPrice: newPrice });
            this.updatePurchaseState(updatedIngredients);
        }
    };


    render() {
        const disabledInfo = {
            ...this.state.ingredients
        };

        for (let key in disabledInfo) {
            disabledInfo[key] = disabledInfo[key] <= 0;
        }

        let orderSummary = <OrderSummary
            ingredients={ this.state.ingredients }
            purchaseCancelled={ this.purchaseCancelHandler }
            purchaseContinue={ this.purchaseContinueHandler }
            totalPrice={ this.state.totalPrice.toFixed(2) }
        />;
        if (this.state.loading) {
            orderSummary = <Spinner/>;
        }

        return (
            <Aux>
                <Modal show={ this.state.purchasing } modalClose={ this.purchasedCancelHandler }>
                    { orderSummary }
                </Modal>
                <Burger ingredients={ this.state.ingredients }/>
                <BuildControls
                    ordered={ this.updatePurchasing }
                    totalPrice={ this.state.totalPrice }
                    disabled={ disabledInfo }
                    addIngredientHandler={ this.addIngredient }
                    removeIngredientHandler={ this.removeIngredient }
                    purchasable={ !this.state.purchasable }
                />
            </Aux>
        )
    }
}

export default withErrorHandler(BurgerBuilder, axios);
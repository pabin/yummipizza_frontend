import React from 'react';
import { connect } from 'react-redux';

import {
  Row,
  Col,
  Button,
  Form,
} from 'react-bootstrap';

import './ItemDetail.css'
import QuantityCalculator from '../../components/QuantityCalculator'
import Rating from '../../components/Rating'
import Spinner from '../../components/Spinner'

import Message from '../../components/Message'
import FullScreenLoading from '../../components/FullScreenLoading'

import { shoppingCartCreateAPI, shoppingCartUpdateAPI } from '../../api/CartAPIs';
import { commentCreateAPI } from '../../api/CommentAPIs';

import { userAuthenticationSuccess } from '../../store/actions/AuthenticationActions';
import { commentFetchSuccess } from '../../store/actions/CommentActions';
import { commentFetch } from '../../store/actions/CommentActions';


// Item detail page, displays all the details of a particular item
// User can rate a item and give reviews from this page
class ItemDetail extends React.Component {
  constructor(props) {
    super(props)

    this.state = {
      loading: false,
      showSuccessMessage: false,
      showFailureMessage: false,
      successMessage: "Added Successfully",
      failureMessage: "",
      itemSize: "MEDIUM",
      quantity: 1,
      comment: "",
    }
    this.props.dispatchCommentFetch(this.props.location.state.item.id)
  }

  // Create new cart if no cart is present else update items to valid cart
  onAddToCart = () => {
    const { item } = this.props.location.state

    const { authentication: {
      userAuthenticated,
      token,
      user,
    }} = this.props

    if (userAuthenticated) {

      this.setState({loading: true})
      if (user.valid_cart) {
        const if_exist = user.valid_cart.cart_items.filter(cart_item => cart_item.item.id === item.id)

        if (if_exist.length > 0) {
          this.setState({failureMessage: "Already in Cart!"})
          this.failureMessageAlert()
        } else {

          const cart_item = {
            item_id: item.id,
            quantity: this.state.quantity,
            size: this.state.itemSize
          }

          let data = {cart_item: cart_item}
          shoppingCartUpdateAPI(data, user.valid_cart.id)
          .then(response => {
            if (response.data) {
              user.valid_cart = response.data
              localStorage.setItem('user', JSON.stringify(user))
              this.props.updateUserDetail(token, user)

              this.successMessageAlert()

            } else if (response.error) {
              this.failureMessageAlert()
            }
          })

        }

      } else {
        const data = {
          cart_item: {
            item_id: item.id,
            quantity: this.state.quantity,
            size: this.state.itemSize
          }
        }

        shoppingCartCreateAPI(data)
        .then(response => {
          if (response.data) {
            user.valid_cart = response.data
            localStorage.setItem('user', JSON.stringify(user))
            this.props.updateUserDetail(token, user)

            this.successMessageAlert()
            this.setState({loading: false})

          } else if (response.error) {
            this.failureMessageAlert()
            this.setState({loading: false})
          }
      })
    }
    } else {
      console.log('user is not authenticated, show login message');
      this.props.onLoginPress()
    }
  }

  // Displays loading screen for 1.5 second
  showingLoading = (messageAlert) => {
    setTimeout(() => {
      messageAlert()
    }, 1000);
  }

  // Displays success message for 1 seconds
  successMessageAlert = () => {
    this.setState({loading: false});
    this.setState({showSuccessMessage: true})
    setTimeout(() => {
      this.redirectToHome()
    }, 1000);
  }

  // Displays error message for 1 seconds
  failureMessageAlert = () => {
    this.setState({loading: false});
    this.setState({showFailureMessage: true})
    setTimeout(() => {
      this.setState({showFailureMessage: false})
    }, 1000);
  }

  redirectToHome = () => {
    this.setState({showSuccessMessage: false})
    this.props.history.push("/");
  }


  increaseQuantity = () => {
    const { quantity } = this.state
    this.setState({quantity: quantity > 8 ? 9 : quantity+1})
  }

  decreaseQuantity = () => {
    const { quantity } = this.state
    this.setState({quantity: quantity > 1 ? quantity-1 : 1})
  }


  // API for Create item review
  onReviewCreate = (message) => {
    const { authentication: {
      user,
    }} = this.props

    const { item } = this.props.location.state

    var { comments: {
      comments,
    }} = this.props

    commentCreateAPI(message, user.id, item.id)
    .then(response => {
      if (response.data) {

        comments.results.push(response.data)
        this.props.onCommentUpdate(comments)
        this.setState({comment: ""})

      } else if (response.error) {
        // log errorr
      }
    })
  }

  handleReviewComment = (e) => {
    if (e.key === 'Enter') {
      console.log('do validate', e.target.value);
      this.onReviewCreate(e.target.value)
    }
  }


  render() {
    const { comments: {
      commentFetched,
      commentFetching,
      comments,
    }} = this.props

    const { authentication: {
      userAuthenticated,
      user,
    }} = this.props

    const { item } = this.props.location.state
    const { showSuccessMessage, showFailureMessage, loading, quantity } = this.state

    let containerStyle = {
      padding: "0px 30px 0px 30px",
      backgroundColor: '#EBEDEF',
      display: 'flex',
      flexDirection: "column"
    }

    let rowstyle = {
      backgroundColor: 'white',
      margin: '10px',
      padding: '20px',
      borderRadius: '5px'
    }

    let ratingRowStyle = {
      backgroundColor: 'white',
      margin: "10px 0px 10px 10px",
      padding: '20px',
      borderRadius: '5px'
    }

    let topSellerRowStyle = {
      backgroundColor: 'white',
      margin: "10px 10px 10px 0px",
      padding: '20px',
      borderRadius: '5px'
    }

    // console.log('item at item detail page ===> ', item);
    // console.log('user at user detail page ===> ', user);

    return (
      <div style={containerStyle}>
        <Row style={rowstyle} className="custom-shadow">
          <Col sm={5} className="d-flex align-items-center justify-content-center">
            <img
              style={{marginRight: "10px", borderRadius: '5px'}}
              src={item.item_image}
              width="100%"
              height="auto"
              className="d-inline-block align-top"
              alt="Item Image"
            />
          </Col>
          <Col sm={4}>
            <h5>{item.name}</h5>

            <Rating rating={item.ratings_value.average_rating} />

            <hr/ >
            <h4 style={{color: "orange"}}>$ {item.ls_price}</h4>
            <hr/ >
            <Row>
              <Col sm={2}>
                <h6 className="title">Size</h6>
              </Col>
              <Col sm={10}>
                <Form inline style={{justifyContent: 'space-around'}}>
                  <Form.Check
                    custom
                    type="radio"
                    id="medium_size"
                    name="size_radio"
                    label="Medium"
                    checked={this.state.itemSize === "MEDIUM" ? true : false}
                    onChange={() => this.setState({itemSize: 'MEDIUM'})}
                    />
                  <Form.Check
                    custom
                    type="radio"
                    id="large_size"
                    name="size_radio"
                    label="Large"
                    onChange={() => this.setState({itemSize: 'LARGE'})}
                    />
                </Form>
              </Col>
            </Row>
            <Row style={{marginTop: '20px'}}>
              <Col sm={3}>
                <h6 className="title">Quantity</h6>
              </Col>
              <Col sm={9}>
                <QuantityCalculator quantity={quantity} increaseQuantity={this.increaseQuantity} decreaseQuantity={this.decreaseQuantity} />
              </Col>
            </Row>

            <Row style={{marginTop: '20px'}}>
              <Col md={6}>
                <Button onClick={() => this.props.history.push('/')} variant="secondary" block>Continue Shopping</Button>
              </Col>
              <Col md={6}>
                <Button onClick={this.onAddToCart} variant="primary" block>Add to Cart</Button>
              </Col>
            </Row>


          </Col>
          <Col sm={3}>
            <h6 className="title">Delivery Options</h6>
            <p><i className="fa fa-map-marker" style={{fontSize: '20px', margin: '5px'}}></i> With in 20 KM of city</p>
            <hr/ >

            <h6 className="title">Return Policy</h6>
            <p><i className="fa fa-exclamation-circle" style={{fontSize: '20px', margin: '5px'}}></i>No return of delivered goods</p>
            <hr/ >
          </Col>
        </Row>

        <Row>
          <Col sm={8}>
            <Row style={ratingRowStyle} className="custom-shadow">
              <Col sm={4}>
                <h6>Rate this item</h6>
                <Rating rating={5} size={25} cursor="pointer" />
                <Rating rating={4} size={25} />
                <Rating rating={3} size={25} />
                <Rating rating={2} size={25} />
                <Rating rating={1} size={25} />
              </Col>
              <Col sm={4}>
                <h5>Total Rating</h5>
                <h3>{item.ratings_value.total_ratings}</h3>
              </Col>
              <Col sm={4}>
                <h5>Average Rating</h5>
                <h3>{item.ratings_value.average_rating}</h3>
              </Col>
            </Row>
            <Row style={ratingRowStyle} className="custom-shadow">
              <Col sm={12}>
                {
                  commentFetched ?
                  <div>
                    <h6>{comments.count} user Reviews </h6>
                    <hr />
                    {
                      comments.results.map((comment, index) => (
                        <Row style={{marginBottom: '10px'}}>
                          <Col sm={2} style={{ display: "flex", flexDirection: 'column', alignItems: 'center', justifyContent: 'center'}}>
                            {
                              comment.user.user_image ?
                              <img
                                style={{borderRadius: '100px', alignSelf: 'center'}}
                                src={comment.user.user_image}
                                width="50%"
                                height="auto"
                                className="d-inline-block align-top"
                                alt="User logo"
                                />
                              :
                              <i className="fa fa-user fa-3x"></i>

                            }
                          </Col>
                          <Col sm={9} style={{backgroundColor: '#EFEFEF', borderRadius: '10px', padding: '10px'}}>
                            <span style={{fontWeight: 'bold'}}>{comment.user.first_name} {comment.user.last_name}</span><br/>
                            <span>{comment.message}</span>
                          </Col>
                        </Row>
                    ))
                    }

                    {
                      userAuthenticated ?

                      <Row style={{marginTop: '25px', marginBottom: '20px'}}>
                        <Col sm={2} style={{ display: "flex", flexDirection: 'column', alignItems: 'center', justifyContent: 'center'}}>
                          {
                            user.user_image ?
                            <img
                              style={{ borderRadius: '100px', alignSelf: 'center'}}
                              src={user.user_image}
                              width="40%"
                              height="auto"
                              className="d-inline-block align-top"
                              alt="User logo"
                              />
                            :
                            <i className="fa fa-user fa-3x"></i>
                          }
                        </Col>

                        <Col sm={9} style={{padding: '0px', marginTop: '5px'}}>
                          <Form.Control
                            style={{backgroundColor: '#EFEFEF', borderRadius: '10px', padding: '10px', margin: '0px'}}
                            type="text"
                            onKeyDown={this.handleReviewComment}
                            value={this.state.comment}
                            onChange={(e) => this.setState({comment: e.target.value})}
                            placeholder="Write your review..." />
                        </Col>
                      </Row>
                      : null
                    }
                  </div>
                  : commentFetching ?
                  <Spinner />
                  : null
                }
              </Col>
            </Row>
          </Col>
          <Col sm={4}>
            <Row style={topSellerRowStyle} className="custom-shadow">
              <Col sm={12}>
                <h5>Recommended Product</h5>
                <Row>
                  <Col sm={8}>
                    <p>{item.name}</p>
                    <img
                      style={{ alignSelf: 'center', borderRadius: '10px'}}
                      src={item.item_image}
                      width="100%"
                      height="auto"
                      className="d-inline-block align-top"
                      alt="Item Image"
                      />
                  </Col>
                  <Col className="d-flex align-items-center justify-content-center">
                     <h1>${item.ls_price}</h1>
                  </Col>
                </Row>
              </Col>
            </Row>
            <Row style={topSellerRowStyle} className="custom-shadow">
              <Col sm={12}>
                <h5>Recommended Product</h5>
                <Row>
                  <Col sm={8}>
                    <p>{item.name}</p>
                    <img
                      style={{ alignSelf: 'center', borderRadius: '10px'}}
                      src={item.item_image}
                      width="100%"
                      height="auto"
                      className="d-inline-block align-top"
                      alt="Item Image"
                      />
                  </Col>
                  <Col className="d-flex align-items-center justify-content-center">
                     <h1>${item.ls_price}</h1>
                  </Col>
                </Row>
              </Col>
            </Row>
          </Col>
        </Row>

        <FullScreenLoading show={loading} message="Adding Item..." />
        <Message
          successMessage={this.state.successMessage}
          failureMessage={this.state.failureMessage}
          showSuccessMessage={showSuccessMessage}
          showFailureMessage={showFailureMessage} />

      </div>
    );
  }
}



const mapStateToProps  = state => ({
  authentication: state.authentication,
  comments: state.comments
})

const mapDispatchToProps = {
  updateUserDetail: (token, user) => userAuthenticationSuccess(token, user),
  dispatchCommentFetch: (item_id) => commentFetch(item_id),
  onCommentUpdate: (comments) => commentFetchSuccess(comments),
}

export default connect(mapStateToProps, mapDispatchToProps)(ItemDetail)

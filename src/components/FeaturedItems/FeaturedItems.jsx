
import React, { useState, useEffect } from 'react';
import './FeaturedItems.css';
import FavoriteBorderIcon from "@mui/icons-material/FavoriteBorder";
import AddIcon from '@mui/icons-material/Add';
import { environment } from '../../environments/environment';
import { useTranslation } from 'react-i18next';
import axios from 'axios';
import CircularProgress from '@mui/material/CircularProgress';
import { useNavigate } from 'react-router-dom';
import CloseIcon from '@mui/icons-material/Close';

const FeaturedItems = () => {
    const { t } = useTranslation();
    const [toasts, setToasts] = useState([]);
    const [data, setData] = useState([]);
    const [loading, setLoading] = useState(true);
    const navigate = useNavigate();
    const [loadingProductId, setLoadingProductId] = useState(null);
    const [errorMessage, setErrorMessage] = useState('');
    const [successfulMessage, setSuccessfulMessage] = useState(false);

    const baseUrl = environment.serverOrigin;

    const getData = async () => {
        try {
            setLoading(true);
            const response = await axios.get(`${environment.serverOrigin}details/shopProductsTab?from=2025-05-20&to=2025-12-20`, {
                headers: {
                    Authorization: `Anonymous=${environment.appid}`,
                },
            });
            let items = (response?.data?.items || []).filter(
                (item) => item.status === 'Active'
            );
            setData(items);
        } catch (err) {
            console.log('error when get products FeaturedItems', err);
        } finally {
            setLoading(false);
        }
    };

    const getOrCreateCart = async (token, userId) => {
        const pendingCartResponse = await axios.get(
            `${baseUrl}shopCartTab?q=properties.status:pending`,
            {
                headers: {
                    Authorization: `Bearer ${token}`
                }
            }
        );

        let cartId;

        if (!pendingCartResponse?.data?.items || pendingCartResponse?.data?.items?.length === 0) {
            const newCartResponse = await axios.post(
                `${baseUrl}shopCartTab`,
                {
                    properties: {
                        customerId: userId,
                        status: 'pending'
                    }
                },
                {
                    headers: {
                        Authorization: `Bearer ${token}`
                    }
                }
            );
            cartId = newCartResponse?.data?.items?.[0]?.id;
        } else {
            cartId = pendingCartResponse?.data?.items?.[0]?.id;
        }

        localStorage.setItem("cartID", cartId);
        return cartId;
    };

    const addOrUpdateCartItem = async (token, cartId, cartItem) => {
        const getCartItems = await axios.get(
            `${baseUrl}shopCartItemsTab?q=parentid:"${cartId}"`,
            {
                headers: {
                    Authorization: `Bearer ${token}`
                },
            }
        );

        const existingItems = getCartItems.data.items;
        const existingProduct = existingItems.find((item) =>
            item?.productId === cartItem?.productId
        );

        if (existingProduct) {
            existingProduct.quantity = (
                parseInt(existingProduct?.quantity) + parseInt(cartItem.quantity)
            ).toString();

            const itemToUpdate = { ...existingProduct };
            delete itemToUpdate.id;

            await axios.patch(
                `${baseUrl}shopCartItemsTab/${existingProduct.id}`,
                itemToUpdate,
                {
                    headers: {
                        Authorization: `Bearer ${token}`
                    },
                }
            );
        } else {
            const DTO = { ...cartItem };
            delete DTO.id;

            await axios.post(
                `${baseUrl}shopCartItemsTab`,
                DTO,
                {
                    headers: {
                        Authorization: `Bearer ${token}`
                    }
                }
            );
        }
    };

    const navigateToProduct = (id) => {
        navigate("/Product", { state: { ID: id } });
    };

    const showSuccessMessage = () => {
        setSuccessfulMessage(true);
        setTimeout(() => {
            setSuccessfulMessage(false);
        }, 1000);
    };

    

    const showToast = (severity, summary, detail = '') => {
        const id = Date.now();
        setToasts(prev => [...prev, { id, severity, summary, detail }]);
        setTimeout(() => {
            setToasts(prev => prev.filter(t => t.id !== id));
        }, 3000);
    };

    const addToCart = async (productData) => {
        setLoadingProductId(productData.id);
        setErrorMessage('');
        const token = localStorage.getItem("token");
        if (!token) {
            setLoadingProductId(null);
            navigate("/Signin");
            return;
        }

        try {
            const selectedProduct = await axios.get(
                `${baseUrl}shopProductsTab/${productData.id}`,
                {
                    headers: {
                        Authorization: `Anonymous=${environment.appid}`,
                    },
                }
            );

            const userId = localStorage.getItem('userId');
            if (!userId) {
                throw new Error("User ID not found");
            }

            const cartId = await getOrCreateCart(token, userId);
            const cartItem = {
                ...selectedProduct.data,
                parentid: cartId,
                productId: selectedProduct.data.id,
                quantity: "1"
            };

            await addOrUpdateCartItem(token, cartId, cartItem);
            showToast('success', 'Add product to cart successfully!');



            // showSuccessMessage();

        } catch (error) {
            console.error("Error adding to cart:", error);
            showToast('error', 'Error', error.response?.data?.message || 'Failed to add product to cart');
            // setErrorMessage(error.response?.data?.message || error.message || "Failed to add product to cart");
            // setTimeout(() => setErrorMessage(''), 3000);
        } finally {
            setLoadingProductId(null);
        }
    };

    useEffect(() => {
        getData();
    }, []);

    return (
        <>


            <div className='container-max'>
                <div className='FeaturedItems'>

                    <div className="new-arrivals">
                        <div className="header">

                            <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>

                                <h2>Featured Products</h2>
                                <p>
                                    Don't miss this opportunity at a special discount just for this week.
                                </p>
                            </div>
                            <span
                                style={{ cursor: 'pointer' }}
                                onClick={() => {
                                    navigate('/shop')
                                }}
                                className="view-all"
                            >
                                View All →
                            </span>
                        </div>
                    </div>

                    {loading ? (
                        <div style={{
                            display: 'flex',
                            justifyContent: 'center',
                            alignItems: 'center',
                            minHeight: '300px'
                        }}>
                            <CircularProgress />
                        </div>
                    ) : data.length === 0 ? (
                        <div style={{
                            textAlign: 'center',
                            padding: '40px 20px',
                            color: '#666'
                        }}>
                            <p style={{ fontSize: '18px' }}>No data found</p>
                        </div>
                    ) : (
                        <div className="products-grid">
                            {data.slice(10, 16).map((item) => (
                                <div className="product-card" key={item.id}>
                                    <div className="product-image-container">
                                        <FavoriteBorderIcon className="favorite-icon" />
                                        {item.discount > 0 && (
                                            <div className="discount-badge">{item.discount}%</div>
                                        )}
                                        <img
                                            style={{ cursor: 'pointer' }}
                                            onClick={() => {
                                                navigateToProduct(item.id)
                                            }}
                                            className="product-image"
                                            src={item?.iconPath ? `${baseUrl}_xfilestore/mada/${item.iconPath}` : ''}
                                            alt={item.name}
                                        />
                                    </div>

                                    <div className="products-info">
                                        <h3 className="product-title">{item.name}</h3>

                                        <div className="price-box">
                                            <span className="price">
                                                JOD {((+item?.price - (+item?.price * (item?.discount || 0)) / 100)).toFixed(2)}
                                            </span>
                                            {item.discount > 0 && (
                                                <span className="old-price">JOD {item.price}</span>
                                            )}
                                        </div>

                                        <button
                                            onClick={() => {
                                                addToCart(item)
                                            }}
                                            className="add-to-cart"
                                            disabled={loadingProductId === item.id}
                                        >
                                            {loadingProductId === item.id ? (
                                                <CircularProgress size={20} style={{ color: '#6b4c9a' }} />
                                            ) : (
                                                <>
                                                    {t("newArrivals.addToCart")}
                                                    <AddIcon style={{ fontSize: "20px" }} />
                                                </>
                                            )}
                                        </button>
                                    </div>
                                </div>
                            ))}
                        </div>
                    )}
                </div>

            </div>

            <div className="toast-container">
                {toasts.map(toast => (
                    <div key={toast.id} className={`toast toast-${toast.severity}`}>
                        <strong>{toast.summary}</strong>
                        {toast.detail && <p>{toast.detail}</p>}
                    </div>
                ))}
            </div>
        </>
    );
};

export default FeaturedItems;
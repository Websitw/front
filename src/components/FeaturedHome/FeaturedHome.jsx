// import React, { useState, useEffect } from 'react';
// import './FeaturedHome.css';
// import paymentImage from '../../assets/image/undraw_online-payments_p97e.svg'
// import newStocks from '../../assets/image/undraw_things-to-say_f5mi.svg';
// import Delivery from '../../assets/image/undraw_delivery-truck_mjui.svg';
// const FeaturedHome = () => {

//     const features = [
//         {
//             icon: paymentImage,
//             title: "Payment only online",
//             description: "Tasigförsamhet beteendedesign. Mobile checkout. Ylig kärtropa."
//         },
//         {
//             icon: newStocks,
//             title: "New stocks and sales",
//             description: "Tasigförsamhet beteendedesign. Mobile checkout. Ylig kärtropa."
//         },
//         {
//             icon: Delivery,
//             title: "Delivery from 24 hour",
//             description: "Tasigförsamhet beteendedesign. Mobile checkout. Ylig kärtropa."
//         }
//     ];

//     return (
//         <>
//             <div className='container-max'>
//                 <div className="features-container">
//                     {features.map((item, index) => (
//                         <div key={index} className="feature-card">
//                             <img className="icon" src={item.icon} />

//                             <div>
//                                 <h3>{item.title}</h3>
//                                 <p>{item.description}</p>
//                             </div>
//                         </div>
//                     ))}
//                 </div>
//             </div>
//         </>
//     );
// };

// export default FeaturedHome;
import React from 'react';
import './FeaturedHome.css';
import { useTranslation } from 'react-i18next';
import paymentImage from '../../assets/image/undraw_online-payments_p97e.svg';
import newStocks from '../../assets/image/undraw_things-to-say_f5mi.svg';
import Delivery from '../../assets/image/undraw_delivery-truck_mjui.svg';

const FeaturedHome = () => {
    const { t } = useTranslation();

    const features = [
        {
            icon: paymentImage,
            title: t('featuredHome.paymentTitle'),
            description: t('featuredHome.paymentDesc'),
        },
        {
            icon: newStocks,
            title: t('featuredHome.stocksTitle'),
            description: t('featuredHome.stocksDesc'),
        },
        {
            icon: Delivery,
            title: t('featuredHome.deliveryTitle'),
            description: t('featuredHome.deliveryDesc'),
        }
    ];

    return (
        <div className='container-max'>
            <div className="features-container">
                {features.map((item, index) => (
                    <div key={index} className="feature-card">
                        <img className="icon" src={item.icon} alt={item.title} />
                        <div>
                            <h3>{item.title}</h3>
                            <p>{item.description}</p>
                        </div>
                    </div>
                ))}
            </div>
        </div>
    );
};

export default FeaturedHome;

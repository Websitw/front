import { useState, useEffect } from 'react'
import imageNotFound from '../../assets/page-not-found.png'
const NotFound = () => {

    return (
      
        <div style={{display:'flex' , justifyContent:'center', alignItems:'center'}}>
        <img style={{width:"500px" , height:'500px'}} src={imageNotFound} alt=''/>
        </div>
    )
}

export default NotFound

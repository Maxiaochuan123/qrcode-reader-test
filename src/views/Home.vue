<!--
 * @Description: In User Settings Edit
 * @Author: your name
 * @Date: 2019-08-18 10:13:28
 * @LastEditTime: 2019-08-18 14:27:47
 * @LastEditors: Please set LastEditors
 -->
<template>
  <div class="home">
    <VueQrcode :text="text" :size="size" :bgSrc="bgSrc" :correctLevel="3" :logoSrc="logoSrc" :margin="margin" :backgroundColor="backgroundColor"></VueQrcode>
  </div>
</template>

<script>
// @ is an alias to /src
import VueQrcode from 'vue-qr'
export default {
  name: 'home',
  components:{ VueQrcode },
  data(){
    return{
      text:'{name:"张三",age:18}',
      size:300,
      correctLevel: 3, //正确等级
      margin:12,
      bgSrc:require('../assets/dog.jpeg'),
      logoSrc:require('../assets/dog.jpeg'),
      backgroundColor:'#eee',
    }
  }
}
</script>

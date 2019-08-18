<!--
 * @Description: In User Settings Edit
 * @Author: your name
 * @Date: 2019-08-18 18:01:27
 * @LastEditTime: 2019-08-18 21:00:54
 * @LastEditors: Please set LastEditors
 -->
<template>
  <div>
    <button id="J_btn_scanQR" class="btn btn-default" @click="getAli">扫一扫二维码</button>
  </div>
</template>
<script>
import VConsole from 'vconsole'
import '../alipayjsapi'
export default {
    data(){
        return{

        }
    },
    mounted(){
        new VConsole();
    },
    methods:{
        getAli(){
            ap.scan(function(res){
                ap.alert(res.code);
            });
        }
    }
};
</script>

<style>
</style>
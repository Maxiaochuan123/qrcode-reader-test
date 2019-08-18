<!--
 * @Description: In User Settings Edit
 * @Author: your name
 * @Date: 2019-08-18 10:13:28
 * @LastEditTime: 2019-08-18 18:04:24
 * @LastEditors: Please set LastEditors
 -->
<template>
  <div id="app">
    <div id="nav">
      <router-link to="/">Home</router-link> |
      <router-link to="/jsQR">jsQR</router-link> |
      <router-link to="/qrcodeReader">qrcodeReader</router-link> |
      <router-link to="/test">test</router-link>
    </div>
    <router-view/>
  </div>
</template>

<style lang="scss">
#app {
  font-family: 'Avenir', Helvetica, Arial, sans-serif;
  -webkit-font-smoothing: antialiased;
  -moz-osx-font-smoothing: grayscale;
  text-align: center;
  color: #2c3e50;
}
#nav {
  padding: 30px;
  a {
    font-weight: bold;
    color: #2c3e50;
    &.router-link-exact-active {
      color: #42b983;
    }
  }
}
</style>

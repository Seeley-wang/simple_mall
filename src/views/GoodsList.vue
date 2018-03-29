<template>
    <div>
    <nav-header></nav-header>
    <nav-bread>
      <slot><span>商品列表</span></slot>
    </nav-bread>
      <div class="accessory-result-page accessory-page">
        <div class="container">
          <div class="filter-nav">
            <span class="sortby">排序:</span>
            <a href="javascript:void(0)" @click="sortFlag=true" class="default cur">默认</a>
            <a href="javascript:void(0)" @click="sortGoods()" class="price">价格 
                <svg class="icon icon-arrow-short" :class="{'sort-up':!sortFlag}"><use xlink:href="#icon-arrow-short"></use></svg></a>
            <a href="javascript:void(0)" @click="showFilterPop()" class="filterby stopPop">筛选</a>
          </div>
          <div class="accessory-result">
            <div class="filter stopPop" id="filter" :class="{'filterby-show':filterBy}">
              <dl class="filter-price">
                <dt>价格:</dt>
                <dd><a href="javascript:void(0)" @click="priceChecked='all'" :class="{'cur':priceChecked==='all'}">全部商品</a></dd>
                <dd v-for="(price,index) in priceFilter" :key="price.index" @click="setPriceChecked(index)">
                  <a href="javascript:void(0)"  :class="{'cur':priceChecked===index}">{{price.startPrice}} - {{price.endPrice}}</a>
                </dd>
              </dl>
            </div>
            <div class="accessory-list-wrap">
              <div class="accessory-list col-4">

                <ul>
                  <li v-for="good in goodsList" :key="good.productId">
                    <div class="pic">
                      <a href="#"><img v-lazy="'static/'+good.productImage" alt=""></a>
                    </div>
                    <div class="main">
                      <div class="name">{{good.productName}}</div>
                      <div class="price">{{good.salePrice}}</div>
                      <div class="btn-area">
                        <a href="javascript:;" class="btn btn--m" @click="addCart(good.productId)">加入购物车</a>
                      </div>
                    </div>
                  </li>
                </ul>
                <div class="loadMore" v-infinite-scroll="loadMore" infinite-scroll-disabled="busy" infinite-scroll-distance="30">
                    <img src="./../assets/loading-spinning-bubbles.svg" v-show="loading">
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
      <div class="md-overlay" v-show="overlayFlag" @click="closePop()"></div>
      <modal :mdShow="mdShow" v-on:close="closeModal">
          <p slot="message">
              请先登录,否则无法加入购物车中
          </p>
          <div slot="btnGroup" @click="mdShow=false">
              <a class="btn btn--m">关闭</a>
          </div>
      </modal>
       <modal :mdShow="mdShowCart" v-on:close="closeModal">
          <p slot="message">
              <svg class="icon-status-ok" :class="{'sort-up':!sortFlag}"><use xlink:href="#icon-status-ok"></use></svg>
              <span>加入购物车成功</span>
          </p>
          <div slot="btnGroup" >
              <a href="javascript:;" class="btn btn--m" @click="mdShowCart=false">继续购物</a>
              <router-link  href="javascript:;" class="btn btn--m" to="/cart">查看购物车</router-link>
          </div>
      </modal>
     <nav-footer></nav-footer>
    </div>
</template>
<script>
import "./../assets/css/base.css";
import "./../assets/css/product.css";
import NavHeader from "@/components/NavHeader";
import NavFooter from "@/components/NavFooter";
import NavBread from "@/components/NavBread";
import Modal from "@/components/Modal";
import axios from "axios";
export default {
    data() {
        return {
            goodsList: [],
            priceFilter: [
                {
                    startPrice: "0.00",
                    endPrice: "100.00"
                },
                {
                    startPrice: "100.00",
                    endPrice: "500.00"
                },
                {
                    startPrice: "500.00",
                    endPrice: "1000.00"
                },
                {
                    startPrice: "1000.00",
                    endPrice: "5000.00"
                }
            ],
            priceChecked: "all",
            filterBy: false,
            overlayFlag: false,
            sortFlag: true,
            page: 1,
            pageSize: 8,
            busy: false,
            loading: false,
            mdShow: false,
            mdShowCart: false
        };
    },
    mounted() {
        this.getGoodsList();
    },
    methods: {
        getGoodsList(flag) {
            let param = {
                page: this.page,
                pageSize: this.pageSize,
                sort: this.sortFlag ? 1 : -1,
                priceLevel: this.priceChecked
            };
            this.loading = true;
            axios
                .get("/goods/list", {
                    params: param
                })
                .then(response => {
                    let res = response.data;
                    if (res.status == "0") {
                        if (flag) {
                            this.goodsList = this.goodsList.concat(
                                res.result.list
                            );
                            if (res.result.count < 8) {
                                this.busy = true;
                                this.loading = false;
                            } else {
                                this.busy = false;
                            }
                        } else {
                            this.goodsList = res.result.list;
                            this.busy = false;
                        }
                    } else {
                        this.goodsList = [];
                    }
                });
        },
        setPriceChecked(index) {
            this.priceChecked = index;
            this.page = 1;
            this.getGoodsList();
            this.closePop();
        },
        showFilterPop() {
            (this.filterBy = true), (this.overlayFlag = true);
        },
        closePop() {
            (this.filterBy = false), (this.overlayFlag = false);
        },
        sortGoods() {
            this.sortFlag = !this.sortFlag;
            this.page = 1;
            this.getGoodsList();
        },
        loadMore() {
            this.busy = true;
            setTimeout(() => {
                this.page++;
                this.getGoodsList(true);
            }, 500);
        },
        addCart(productId) {
            axios
                .post("/goods/addCart", {
                    productId: productId
                })
                .then(res => {
                    if (res.data.status == 0) {
                        this.mdShowCart = true;
                    } else {
                        this.mdShow = true;
                    }
                });
        },
        closeModal() {
            this.mdShow = false;
            this.mdShowCart = false;
        }
    },
    components: {
        NavHeader,
        NavFooter,
        NavBread,
        Modal
    }
};
</script>

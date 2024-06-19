import Vue from "vue";
import VueRouter from "vue-router";
import BoardList from "@/components/board/BoardList";
import BoardDetail from "@/components/board/BoardDetail";
import BoardCreate from "@/components/board/BoardCreate";

import MainPage from "@/components/MainPage";
import LoginPage from "@/components/login/LoginPage";
import Calculator from "@/components/CalculatorComp";

import NotFound from "@/components/NotFound";

Vue.use(VueRouter); // 뷰 어플리케이션에 라우터 플러그인을 추가한다.

// 라우터 객체를 생성
const router = new VueRouter({
  mode: "history",
  routes: [
    {
      path: "/",
      name: "MainPage",
      component: MainPage,
    },
    {
      path: "/login",
      name: "LoginPage",
      component: LoginPage,
    },
    {
      path: "/calculator",
      name: "Calculator",
      component: Calculator,
    },
    {
      path: "/board",
      name: "BoardList",
      component: BoardList,
    },
    {
      path: "/board/detail/:contentId",
      name: "BoardDetail",
      component: BoardDetail,
    },
    {
      path: "/board/create/:contentId?",
      name: "BoardCreate",
      component: BoardCreate,
    },
    {
      path: "*",
      component: NotFound,
    },
  ],
});

//처음 시작을 /login으로 시작하게 처리
router.replace("/login");
export default router;

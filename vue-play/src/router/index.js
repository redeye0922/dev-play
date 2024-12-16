import Vue from "vue";
import VueRouter from "vue-router";
import BoardList from "@/components/board/BoardList";
import BoardDetail from "@/components/board/BoardDetail";
import BoardCreate from "@/components/board/BoardCreate";

import MiniGames from '@/components/MiniGames.vue' 
import AirplaneShooting from '@/components/minigames/AirplaneShooting.vue' 
import AvoidObstacles from '@/components/minigames/AvoidObstacles.vue' 
import BrickBreaker from '@/components/minigames/BrickBreaker.vue' 
import Gomoku from '@/components/minigames/Gomoku.vue' 
import TetrisGame from '@/components/minigames/TetrisGame.vue'

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
    
    { path: '/minigames', name: 'MiniGames', component: MiniGames },
    { path: '/minigames/airplane-shooting', name: 'AirplaneShooting', component: AirplaneShooting }, 
    { path: '/minigames/avoid-obstacles', name: 'AvoidObstacles', component: AvoidObstacles }, 
    { path: '/minigames/brick-breaker', name: 'BrickBreaker', component: BrickBreaker }, 
    { path: '/minigames/gomoku', name: 'Gomoku', component: Gomoku }, 
    { path: '/minigames/tetris-game', name: 'TetrisGame', component: TetrisGame },
    
    {
      path: "*",
      component: NotFound,
    },
  ],
});

// 모든 라우트 변경 전에 미니게임 종료 로직 호출 
router.beforeEach((to, from, next) => { 
  if (from.name === 'TetrisGame' || from.name === 'AirplaneShooting' || from.name === 'AvoidObstacles' || from.name === 'BrickBreaker' || from.name === 'Gomoku') {
    const activeGameComponent = router.app.$children.find(comp => comp.$options.name === from.name);
    if (activeGameComponent && activeGameComponent.cleanup) {
      activeGameComponent.cleanup(); 
    } 
  } next(); 
});

//처음 시작을 /login으로 시작하게 처리
router.replace("/login");
export default router;

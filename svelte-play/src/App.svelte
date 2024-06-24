<script>
	import { beforeUpdate, afterUpdate } from 'svelte';
	import { createTodoStore } from './todos.js';
	import TodoList from './TodoList.svelte';
	
	const todos = createTodoStore([
		/*{ done: false, description: 'write some docs' },
		{ done: false, description: 'start writing blog post' },
		{ done: true, description: 'buy some milk' },
		{ done: false, description: 'mow the lawn' },
		{ done: false, description: 'feed the turtle' },
		{ done: false, description: 'fix some bugs' }*/
	]);

	let div;
	let autoscroll = false;
	
	beforeUpdate(() => {
		// determine whether we should auto-scroll
		// once the DOM is updated...
		if (div) {
			const scrollableDistance = div.scrollHeight - div.offsetHeight;
			autoscroll = div.scrollTop > scrollableDistance - 20;
		}
	});

	afterUpdate(() => {
		// ...the DOM is now in sync with the data
		if (autoscroll) {			
			div.scrollTo(0, div.scrollHeight);
		}
	});
	
</script>

<div class="container">
	<div class="phone">
		<div class="chat">
			<div class="board" bind:this={div}>
				
				<input
					placeholder="what needs to be done?"
					on:keydown={(e) => {
						if (e.key !== 'Enter') return;

						todos.add(e.currentTarget.value);
						e.currentTarget.value = '';
					}}
				/>
				
				<div class="todo">
					<h2>todo</h2>
					<TodoList store={todos} done={false} />
				</div>

				<div class="done">
					<h2>done</h2>
					<TodoList store={todos} done={true} />
				</div>
			</div>
			
		</div>
	</div>	
</div>

<style>
.container {
		display: grid;
		place-items: center;
		height: 100%;
	}

	.phone {
		display: flex;
		flex-direction: column;
		width: 100%;
		height: 100%;
	}

	.chat {
		height: 0;
		flex: 1 1 auto;
		padding: 0 1em;
		overflow-y: auto;
		scroll-behavior: smooth;
	}
	
@media (min-width: 260px) {
	.phone {
		background: var(--bg-2);
		position: relative;
		font-size: min(2.5vh, 1rem);
		width: auto;
		height: 36em;
		aspect-ratio: 9 / 16;
		border: 0.2em solid #222;
		border-radius: 1em;
		box-sizing: border-box;
		filter: drop-shadow(1px 1px 0px #222) drop-shadow(2px 2px 0px #222) drop-shadow(3px 3px 0px #222)
	}

	.phone::after {
		position: absolute;
		content: '';
		background: #222;
		width: 60%;
		height: 1em;
		left: 20%;
		top: 0;
		border-radius: 0 0 0.5em 0.5em
	}
}

@media (prefers-reduced-motion) {
	.chat {
		scroll-behavior: auto;
	}
}


.board {
	display: grid;
	grid-template-columns: 1fr 1fr;
	grid-column-gap: 1em;
	max-width: 36em;
	margin: 0 auto;
}

.board > input {
	font-size: 1.4em;
	grid-column: 1/3;
	padding: 0.5em;
	margin: 2rem 0 1rem 0;
}

h2 {
	font-size: 2em;
	font-weight: 200;
}
</style>

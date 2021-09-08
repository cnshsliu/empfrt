<script lang="ts">
	import type{Template, User} from "$lib/types";
	export let template: Template;
</script>

<div class="article-preview">
	<div class="container">
		<div class="row">
			<div class="col-md-6 offset-md-3 col-xs-12">
				<div class="article-meta">
					<a href="/template/@{template.tplid}" rel="prefetch" class="preview-link"> {template.tplid}
					</a>
					<div class="info"> {template.author}
						<span class="date"> {new Date(template.createdAt).toDateString()} </span>
					</div>
					<div class="pull-xs-right">
						<a class="btn btn-sm" href="/template/@{template.tplid}">
								<i class="ion-eye" />
								查看
						</a>
					</div>
				</div>
			</div>
		</div>
	</div>
</div>

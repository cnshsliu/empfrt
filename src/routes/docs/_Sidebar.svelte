<script context="module">
	import { browser, dev } from '$app/env';

	// we don't need any JS on this page, though we'll load
	// it in dev so that we get hot module replacement...
	export const hydrate = dev;

	// ...but if the client-side router is already loaded
	// (i.e. we came here from elsewhere in the app), use it
	export const router = browser;

	// since there's no dynamic data here, we can prerender
	// it so that it gets served as a static asset in prod
	export const prerender = true;
</script>

<div class="sticky-top kfksidebar">
	<ul class="list-group list-group-flush">
		<li class="list-group-item"><a href="#introduction">Introduction </a></li>
		<li class="list-group-item"><a href="#quickstart">Quick Start</a></li>
		<li class="list-group-item"><a href="#architecture">Architecture</a></li>
		<li class="list-group-item"><a href="#depoymentmodel">Deployment Model</a></li>
		<li class="list-group-item"><a href="#devguide">Dev Guide</a></li>
		<li class="list-group-item kfk-sub-item"><a href="#dg-demo">Demo project</a></li>
		<li class="list-group-item kfk-sub-item"><a href="#dg-sdk-js">Javascript SDK</a></li>
		<li class="list-group-item kfk-sub-item"><a href="#dg-api">APIs</a></li>
		<li class="list-group-item"><a href="#designerguide">Designer Guide</a></li>
		<li class="list-group-item"><a href="#adminguide">Admin Guide</a></li>
		<li class="list-group-item kfk-sub-item">
			<a href="#admin-org">Upgrade Account to org mode</a>
		</li>
		<li class="list-group-item kfk-sub-item"><a href="#invite-member">Invite team members</a></li>
		<li class="list-group-item kfk-sub-item"><a href="#approve-member">Approve team members</a></li>
		<li class="list-group-item kfk-sub-item"><a href="#org-profile">Org profile</a></li>
		<li class="list-group-item kfk-sub-item"><a href="#member-admin">Member Admin</a></li>
		<li class="list-group-item kfk-sub-item-2"><a href="#set-member-group">Set Member Group</a></li>
		<li class="list-group-item kfk-sub-item-2"><a href="#remove-member">Remove Member</a></li>
		<li class="list-group-item"><a href="#userguide">User Guide</a></li>
		<li class="list-group-item kfk-sub-item"><a href="#delegation">Delegation</a></li>
		<li class="list-group-item kfk-sub-item-2"><a href="#delegate">Delegate my work</a></li>
		<li class="list-group-item kfk-sub-item-2"><a href="#delegationtome">Delegation to me</a></li>
		<li class="list-group-item kfk-sub-item-2"><a href="#myprofile">Change display name</a></li>
		<li class="list-group-item kfk-sub-item-2"><a href="#myavatar">Change my avatar</a></li>
		<li class="list-group-item kfk-sub-item-2"><a href="#mypassword">Change my password</a></li>
		<li class="list-group-item kfk-sub-item-2"><a href="#joinorg">Join an organization</a></li>
		<li class="list-group-item"><a href="#user-design-templat">Workflow Template</a></li>
		<li class="list-group-item"><a href="#user-design-templat">Workflow Designer</a></li>
		<li class="list-group-item kfk-sub-item"><a href="#joinorg">Designer</a></li>
		<li class="list-group-item kfk-sub-item-2"><a href="#joinorg">Export</a></li>
		<li class="list-group-item kfk-sub-item-2"><a href="#joinorg">Copy</a></li>
		<li class="list-group-item kfk-sub-item-2"><a href="#joinorg">Rename</a></li>
		<li class="list-group-item kfk-sub-item-2"><a href="#joinorg">Delete</a></li>
		<li class="list-group-item kfk-sub-item-2"><a href="#joinorg">Toggle Edit/View</a></li>
		<li class="list-group-item kfk-sub-item"><a href="#joinorg">Node type</a></li>
		<li class="list-group-item kfk-sub-item-2"><a href="#joinorg">Action node</a></li>
		<li class="list-group-item kfk-sub-item-2"><a href="#joinorg">Script node</a></li>
		<li class="list-group-item kfk-sub-item-2"><a href="#joinorg">Notify node</a></li>
		<li class="list-group-item kfk-sub-item-2"><a href="#joinorg">Sub node</a></li>
		<li class="list-group-item kfk-sub-item-2"><a href="#joinorg">Timer node</a></li>
		<li class="list-group-item kfk-sub-item-2"><a href="#joinorg">And node</a></li>
		<li class="list-group-item kfk-sub-item-2"><a href="#joinorg">Or node</a></li>
		<li class="list-group-item kfk-sub-item-2"><a href="#joinorg">Ground node</a></li>
		<li class="list-group-item kfk-sub-item-2"><a href="#joinorg">Start node</a></li>
		<li class="list-group-item kfk-sub-item-2"><a href="#joinorg">End node</a></li>
		<li class="list-group-item kfk-sub-item-2"><a href="#joinorg">Route</a></li>
		<li class="list-group-item"><a href="#user-start-process">Workflow process</a></li>
		<li class="list-group-item kfk-sub-item"><a href="#joinorg">Start</a></li>
		<li class="list-group-item kfk-sub-item"><a href="#joinorg">Monitor</a></li>
		<li class="list-group-item"><a href="#user-start-process">Worklist</a></li>
		<li class="list-group-item kfk-sub-item"><a href="#user-start-process">Check worklist</a></li>
		<li class="list-group-item kfk-sub-item"><a href="#user-start-process">Do a work</a></li>
		<li class="list-group-item kfk-sub-item"><a href="#user-start-process">Work details</a></li>
		<li class="list-group-item"><a href="#user-start-process">Team</a></li>
		<li class="list-group-item kfk-sub-item"><a href="#user-start-process">Team Role</a></li>
		<li class="list-group-item kfk-sub-item"><a href="#user-start-process">Set participant</a></li>
	</ul>
</div>

<style>
	.kfksidebar {
		min-height: 100vh;
		max-height: 100vh;
		overflow: hidden;
		overflow-y: auto;
		-webkit-transition: margin 0.25s ease-out;
		-moz-transition: margin 0.25s ease-out;
		-o-transition: margin 0.25s ease-out;
		transition: margin 0.25s ease-out;
	}
	.kfksidebar a {
		text-decoration: none;
	}
	.kfk-sub-item {
		padding-left: 2rem;
	}
	.kfk-sub-item-2 {
		padding-left: 4rem;
	}
</style>

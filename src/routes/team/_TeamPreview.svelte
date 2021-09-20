<script lang="ts">
	import { Row, Col, Icon, Styles } from 'sveltestrap';
	import { Button, Dropdown, DropdownItem, DropdownMenu, DropdownToggle } from 'sveltestrap';
	export let team: Team;
	export let mouseover_objid: string;
	export let deleteTeam;
</script>

<Styles />

<Row class={mouseover_objid === team.teamid ? 'cocohighlight-2' : ''}>
	<Col xs="8">
		<div>
			<a href="/team/@{team.teamid}" class="preview-link kfk-team-id">
				{team.teamid}
			</a>
			<div class="kfk-team-info">
				{team.author}
				<span class="date"> {new Date(team.createdAt).toDateString()} </span>
			</div>
		</div>
	</Col>
	<Col xs="2">
		{#if mouseover_objid === team.teamid}
			<a class="btn btn-sm" href="/team/@{team.teamid}">
				<Icon name="diagram-3" class="kfk-team-action-icon" />
				<div class="kfk-icon-title">Open</div>
			</a>
		{/if}
	</Col>
	<Col xs="2">
		{#if mouseover_objid === team.teamid}
			<Dropdown>
				<DropdownToggle caret color="notexist">More <Icon name="three-dots" /></DropdownToggle>
				<DropdownMenu>
					<DropdownItem>
						<a href={'#'} on:click|preventDefault={() => deleteTeam(team.teamid)} class="nav-link "
							><Icon name="x" />
							Delete this team
						</a>
					</DropdownItem>
				</DropdownMenu>
			</Dropdown>
		{/if}
	</Col>
</Row>

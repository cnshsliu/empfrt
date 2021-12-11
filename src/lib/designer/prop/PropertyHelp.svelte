<script lang="ts">
	import { Col } from 'sveltestrap';
	export let helpId;
</script>

{#if helpId === 'ACTION'}
	<Col>
		ACTION An action represents a work need to be done by people.<br />
		<ul>
			<li>Label: the name of this action</li>
			<li>
				Participant: who will be responsible for and receive task of this action.
				<ul>
					<li>
						Participant's Role: it can be an user's ID (email), a role in a team, a upwards-search
						leader query string of a position in orgchart, or a global query string of someone in
						orgchart.
					</li>
					<li>
						by Leader: upward-search leader query string builder, the string is a combination of
						multiple leader position name delimited with colon.
					</li>
					<li>
						by Query: global query string builder, the basic string format is:
						'department_list/position_list'. department_list contains multiple department IDs
						delimited with colon, position_list contains multiple positions delimited with colon.
						Multiple query string can be concatenated with '&'. for example, to search for Director
						in both department1 and department 2, use "department1:department2/Director".
					</li>
				</ul>
			</li>
			<li>Instruction: the instruction to complete the task</li>
		</ul>
	</Col>
{:else if helpId === 'SCRIPT'}
	<Col>SCRIPT HELP HERE</Col>
{:else if helpId === 'CONNECT'}
	<Col>CONNECT HELP HERE</Col>
{:else if helpId === 'INFORM'}
	<Col>INFORM HELP HERE</Col>
{:else if helpId === 'SCRIPT'}
	<Col>SCRIPT HELP HERE</Col>
{:else if helpId === 'SUB'}
	<Col>SUB HELP HERE</Col>
{:else if helpId === 'TIMER'}
	<Col>TIMER HELP HERE</Col>
{/if}

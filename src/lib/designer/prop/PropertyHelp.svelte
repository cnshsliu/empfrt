<script lang="ts">
	import { Col } from 'sveltestrap';
	export let helpId;
</script>

{#if helpId === 'ACTION'}
	<Col>
		ACTION An action represents a work need to be done by people.<br />
		<ul>
			<li><b>Label:</b> the name of this action</li>
			<li>
				<b>Participant:</b> who will be responsible for and receive task of this action.<br />
				Participant's Role: ';' separated PDs (PD: participant definition), each PD can be a team role,
				a user (@userid), a leader (P:position definition) or a query (Q: querystring)
				<a href="/docs#designer_participant" target="_blank"> Details </a>
			</li>
			<li>
				<b>Instruction:</b> the instruction to complete the task. workflow variable values can be
				embeded with VARIABLE_NAME.value in
				<a href="https://handlebarsjs.com/" target="_blank"> Handlebars </a> format
			</li>
			<li>
				<b>Variables:</b> define user input fields for this action.
				<a href="/docs#designer_variables" target="_blank"> Details </a>
			</li>
		</ul>
	</Col>
{:else if helpId === 'SCRIPT'}
	<Col>
		SCRIPT: do anyting you can do on server side
		<ul>
			<li>Interact with other systems by accessing their APIs</li>
			<li>Get resource from other systems</li>
			<li>Change the value of workflow process variable (PV)</li>
			<li>Injest any workflow process variable (PV)</li>
			<li>Decide the routing of following execution</li>
			<a href="/docs#designer_script" target="_blank"> see more </a>
		</ul>
		In your script, you may
		<ul>
			<li>access process variables with "var_name.value"</li>
			<li>inject variables to following process with "retkvars[KEY]=VALUE"</li>
			<li>return a value with "ret=VALUE", which can be used to decide following routing</li>
		</ul>
	</Col>
{:else if helpId === 'CONNECT'}
	<Col>
		Case Value:
		<ul>
			<li>
				If previous node is an action node, the case value will be provided to user to select,
				user's selection will be used to decide which route to go.
			</li>
			<li>
				If previous node is a script node, the return value of the script node will be used to
				decide which route to go.
			</li>
		</ul>
	</Col>
{:else if helpId === 'INFORM'}
	<Col>
		Inform Send message to someone.
		<ul>
			<li>Email: send email to someone</li>
			<li>Meta: send message via Meta (comming..)</li>
			<li>SMS: send message via SMS (comming..)</li>
		</ul>
		You may include KVAR.value in subject and content in Handlebars format, You may also use restricted
		HTML tags in your email contennt.
		<a href="/docs#inform_content" target="_blank"> see details </a>
	</Col>
{:else if helpId === 'SUB'}
	<Col>
		Run a sub-workflow.
		<ul>
			<li>PVs of parent workflow will be brought into sub workflow at start</li>
			<li>PVs of child workflow will be brought back into parent workflow on finish.</li>
		</ul></Col
	>
{:else if helpId === 'TIMER'}
	<Col
		>Time control, the process only run through this node when
		<ul>
			<li><b>From Start:</b> how long after the start of the whole process</li>
			<li>
				<b>From Now:</b> how long after the invoking of this Timer node(end of previous node).
			</li>
			<li><b>Fix: </b> Specific date and time</li>
		</ul>
	</Col>
{/if}

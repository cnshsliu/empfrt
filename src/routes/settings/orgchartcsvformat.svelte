<script type="ts">
	import {
		Card,
		CardBody,
		CardFooter,
		CardHeader,
		CardSubtitle,
		CardText,
		CardTitle,
	} from 'sveltestrap';
</script>

<Card class="bg-light">
	<CardHeader>
		<CardTitle>OrgChart XLSX file format</CardTitle>
		<span class="text-right">
			<a href="/orgdemo/companya/orgchart.xlsx" target="_blank">
				download an example orgchart XLSX file
			</a>
		</span>
	</CardHeader>
	<CardBody>
		<CardSubtitle>Columns</CardSubtitle>
		OU,CN,EMAIL,POSITION
		<ul>
			<li>OU:</li>
			Identification string
			<ul>
				<li>For top organization</li>
				must be "root"
				<li>For department</li>
				must have nx5 characters, every 5 characters represent a orgchart level. must have nx5 characters,
				every 5 characters represent a orgchart level.
				<li>For staff</li>
				Must be the OU he/she is in, staff belongs to the last deparemnt
			</ul>
			<li>CN:</li>
			Comon name
			<ul>
				<li>For top organization</li>
				the name of your organization
				<li>For department</li>
				the name of department
				<li>For staff</li>
				the name of staff
			</ul>
			<li>EMAIL:</li>
			Email of staff
			<ul>
				<li>For top organization</li>
				blank
				<li>For department</li>
				blank
				<li>For staff</li>
				the email of staff
			</ul>
			<li>POSITION:</li>
			The names of staff positions
			<ul>
				<li>For top organization</li>
				blank
				<li>For department</li>
				blank
				<li>For staff</li>
				comma separated positions
			</ul>
		</ul>
	</CardBody>
</Card>

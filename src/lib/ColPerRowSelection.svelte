<script lang="ts">
	import { _ } from '$lib/i18n';
	import { filterStorage } from '$lib/empstores';
	import { Dropdown, DropdownToggle, DropdownMenu, DropdownItem } from 'sveltestrap';
	let col_per_row = { xs: 1, md: 1 };
	let tmp = $filterStorage.col_per_row;
	if (!(tmp && tmp.xs && tmp.md)) {
		$filterStorage.col_per_row = col_per_row;
	} else {
		col_per_row = $filterStorage.col_per_row;
	}
</script>

<Dropdown class="m-0 p-0">
	<DropdownToggle caret color="notexist" class="btn-sm">
		{$_('remotetable.colperrow')}
	</DropdownToggle>
	<DropdownMenu>
		<DropdownItem>
			<a
				class="nav-link"
				href={'#'}
				on:click|preventDefault={() => {
					col_per_row = { xs: 1, md: 1 };
					$filterStorage.col_per_row = col_per_row;
				}}>
				{$_('remotetable.cols-1')}
			</a>
		</DropdownItem>
		<DropdownItem>
			<a
				class="nav-link"
				href={'#'}
				on:click|preventDefault={() => {
					col_per_row = { xs: 1, md: 2 };
					$filterStorage.col_per_row = col_per_row;
				}}>
				{$_('remotetable.cols-2')}
			</a>
		</DropdownItem>
		<DropdownItem>
			<a
				class="nav-link"
				href={'#'}
				on:click|preventDefault={() => {
					col_per_row = { xs: 1, md: 3 };
					$filterStorage.col_per_row = col_per_row;
				}}>
				{$_('remotetable.cols-3')}
			</a>
		</DropdownItem>
		<DropdownItem>
			<a
				class="nav-link"
				href={'#'}
				on:click|preventDefault={() => {
					col_per_row = { xs: 1, md: 4 };
					$filterStorage.col_per_row = col_per_row;
				}}>
				{$_('remotetable.cols-4')}
			</a>
		</DropdownItem>
	</DropdownMenu>
</Dropdown>

<script lang="ts">
	import { Input, InputGroup, InputGroupText, Row, Col, Icon, Container } from 'sveltestrap';
	import { _ } from '$lib/i18n';
	import LocaleSwitcher from '$lib/LocaleSwitcher.svelte';
</script>

<div class="container emp-footer tnt-footer">
	<div class="row m-3">
		<div class="col-sm-6">
			<Container class="mt-3">
				<div><img src="/metatocome.png" style="width:64px; height: 48px;" alt="metatocome" /></div>
				<div class="fs-6">{$_('footer.neural')}</div>
				<Row class="mt-3">
					<Col class="text-primary fs-3">
						<i class="bi-twitter" />
						<i class="bi-github" />
						<i class="bi-discord" />
					</Col>
				</Row>
				<div class="mt-3">
					<InputGroup>
						<InputGroupText>
							<i class="bi-translate" />
						</InputGroupText>
						<LocaleSwitcher />
					</InputGroup>
				</div>
			</Container>
		</div>

		<div class="col-sm-6">
			<Row>
				<Col class="col-sm">
					<Container class="mt-3">
						<Row cols="1">
							<Col>
								<a
									sveltekit:prefetch
									class="fs-5 text-primary text-decoration-none"
									href="/docs/about"
								>
									{$_('footer.PLATFORM')}
								</a>
							</Col>
							<Col>
								<a
									sveltekit:prefetch
									class="emp-footer-link tnt-footer-link text-decoration-none"
									href="/docs/about"
								>
									{$_('footer.video')}
								</a>
							</Col>
							<Col>
								<a
									sveltekit:prefetch
									class="emp-footer-link tnt-footer-link text-decoration-none"
									href="/docs/about"
								>
									{$_('footer.howitworks')}
								</a>
							</Col>
							<Col>
								<a
									sveltekit:prefetch
									class="emp-footer-link tnt-footer-link text-decoration-none"
									href="/docs/about"
								>
									{$_('footer.usecases')}
								</a>
							</Col>
							<Col>
								<a
									sveltekit:prefetch
									class="emp-footer-link tnt-footer-link text-decoration-none"
									href="/docs/about"
								>
									{$_('footer.signup')}
								</a>
							</Col>
							<Col>
								<a
									sveltekit:prefetch
									class="emp-footer-link tnt-footer-link text-decoration-none"
									href="/docs/about"
								>
									{$_('footer.signin')}
								</a>
							</Col>
						</Row>
					</Container>
				</Col>
				<Col class="col-sm">
					<Container class="mt-3">
						<Row cols="1">
							<Col>
								<a
									sveltekit:prefetch
									class="fs-5 text-primary text-decoration-none"
									href="/docs/about"
								>
									{$_('footer.DEVELOPER')}
								</a>
							</Col>
							<Col>
								<a
									sveltekit:prefetch
									class="emp-footer-link tnt-footer-link text-decoration-none"
									href="/docs/about"
								>
									{$_('footer.quickstart')}
								</a>
							</Col>
							<Col>
								<a
									sveltekit:prefetch
									class="emp-footer-link tnt-footer-link text-decoration-none"
									href="/docs/about"
								>
									{$_('footer.examples')}
								</a>
							</Col>
							<Col>
								<a
									sveltekit:prefetch
									class="emp-footer-link tnt-footer-link text-decoration-none"
									href="/docs/about"
								>
									{$_('footer.docsandhelp')}
								</a>
							</Col>
							<Col>
								<a
									sveltekit:prefetch
									class="emp-footer-link tnt-footer-link text-decoration-none"
									href="/docs/about"
								>
									{$_('footer.discord')}
								</a>
							</Col>
							<Col>
								<a
									sveltekit:prefetch
									class="emp-footer-link tnt-footer-link text-decoration-none"
									href="/docs/about"
								>
									{$_('footer.sdks')}
								</a>
							</Col>
							<Col>
								<a
									sveltekit:prefetch
									class="emp-footer-link tnt-footer-link text-decoration-none"
									href="/docs/about"
								>
									{$_('footer.opensource')}
								</a>
							</Col>
						</Row>
					</Container>
				</Col>
				<Col class="col-sm">
					<Container class="mt-3">
						<Row cols="1">
							<Col>
								<a
									sveltekit:prefetch
									class="fs-5 text-primary text-decoration-none"
									href="/docs/about"
								>
									{$_('footer.DEPLOYMENT')}
								</a>
							</Col>
							<Col>
								<a
									sveltekit:prefetch
									class="emp-footer-link tnt-footer-link text-decoration-none"
									href="/docs/about"
								>
									{$_('footer.paas')}
								</a>
							</Col>
							<Col>
								<a
									sveltekit:prefetch
									class="emp-footer-link tnt-footer-link text-decoration-none"
									href="/docs/about"
								>
									{$_('footer.privateinstall')}
								</a>
							</Col>
						</Row>
					</Container>
				</Col>
			</Row>
		</div>
	</div>
</div>

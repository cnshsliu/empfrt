<script lang="ts">
	import { Input, InputGroup, InputGroupText, Row, Col, Icon, Container } from 'sveltestrap';

	let browserLanguage = 'en-US';
</script>

<div class="container emp-footer tnt-footer">
	<div class="row m-3">
		<div class="col-sm-6">
			<Container class="mt-3">
				<div><img src="/metatocome.png" style="width:64px; height: 48px;" alt="metatocome" /></div>
				<div class="fs-6">Neural system for your organiation</div>
				<Row class="mt-3">
					<Col class="text-info fs-3">
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
						<Input
							type="select"
							bind:value={browserLanguage}
							name="select"
							style="max-width:200px;"
						>
							<option value="null">Select-</option>
							<option value="en-US">English</option>
							<!--option value="zh-CN">中文</option -->
						</Input>
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
									class="fs-5 text-info text-decoration-none"
									href="/docs/about"
								>
									PLATFORM
								</a>
							</Col>
							<Col>
								<a
									sveltekit:prefetch
									class="emp-footer-link tnt-footer-link text-decoration-none"
									href="/docs/about"
								>
									Explainer Video
								</a>
							</Col>
							<Col>
								<a
									sveltekit:prefetch
									class="emp-footer-link tnt-footer-link text-decoration-none"
									href="/docs/about"
								>
									How it works
								</a>
							</Col>
							<Col>
								<a
									sveltekit:prefetch
									class="emp-footer-link tnt-footer-link text-decoration-none"
									href="/docs/about"
								>
									Use cases
								</a>
							</Col>
							<Col>
								<a
									sveltekit:prefetch
									class="emp-footer-link tnt-footer-link text-decoration-none"
									href="/docs/about"
								>
									Sign up
								</a>
							</Col>
							<Col>
								<a
									sveltekit:prefetch
									class="emp-footer-link tnt-footer-link text-decoration-none"
									href="/docs/about"
								>
									Log in
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
									class="fs-5 text-info text-decoration-none"
									href="/docs/about"
								>
									DEVELOPER
								</a>
							</Col>
							<Col>
								<a
									sveltekit:prefetch
									class="emp-footer-link tnt-footer-link text-decoration-none"
									href="/docs/about"
								>
									Quick Start
								</a>
							</Col>
							<Col>
								<a
									sveltekit:prefetch
									class="emp-footer-link tnt-footer-link text-decoration-none"
									href="/docs/about"
								>
									Examples
								</a>
							</Col>
							<Col>
								<a
									sveltekit:prefetch
									class="emp-footer-link tnt-footer-link text-decoration-none"
									href="/docs/about"
								>
									Docs & Help
								</a>
							</Col>
							<Col>
								<a
									sveltekit:prefetch
									class="emp-footer-link tnt-footer-link text-decoration-none"
									href="/docs/about"
								>
									Discord
								</a>
							</Col>
							<Col>
								<a
									sveltekit:prefetch
									class="emp-footer-link tnt-footer-link text-decoration-none"
									href="/docs/about"
								>
									SDKs
								</a>
							</Col>
							<Col>
								<a
									sveltekit:prefetch
									class="emp-footer-link tnt-footer-link text-decoration-none"
									href="/docs/about"
								>
									Open Source
								</a>
							</Col>
							<Col>
								<a
									sveltekit:prefetch
									class="emp-footer-link tnt-footer-link text-decoration-none"
									href="/docs/about"
								>
									I18N
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
									class="fs-5 text-info text-decoration-none"
									href="/docs/about"
								>
									DEPLOYMENT
								</a>
							</Col>
							<Col>
								<a
									sveltekit:prefetch
									class="emp-footer-link tnt-footer-link text-decoration-none"
									href="/docs/about"
								>
									PaaS
								</a>
							</Col>
							<Col>
								<a
									sveltekit:prefetch
									class="emp-footer-link tnt-footer-link text-decoration-none"
									href="/docs/about"
								>
									Private Install
								</a>
							</Col>
							<Col>
								<a
									sveltekit:prefetch
									class="emp-footer-link tnt-footer-link text-decoration-none"
									href="/docs/about"
								>
									Open Source
								</a>
							</Col>
						</Row>
					</Container>
				</Col>
			</Row>
		</div>
	</div>
</div>

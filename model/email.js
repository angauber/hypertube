const	Nodemailer = require('nodemailer'),
		Fs = require('fs'),
		sgMail = require('@sendgrid/mail');
let key;


let local = "http://localhost:8008";


module.exports =
{
	accountConfirmationMail(mail, token, callback)
	{
		let txt = `<!DOCTYPE html>
		<html>
		<head>
		<title>Hypertube.com</title>
		<meta charset="utf-8">
		<meta name="viewport" content="width=device-width, initial-scale=1">
		<meta http-equiv="X-UA-Compatible" content="IE=edge" />
		<meta http-equiv="Content-Type" content="text/html charset=UTF-8" />
		<style type="text/css">
          table {border-collapse:separate;}
          a, a:link, {text-decoration: none; color: #00788a;}
          a:hover {text-decoration: underline;}
          h2,h2 a,h3,h3 a,h4,h5,h6,.t_cht {color:#000 !important;}
          .ExternalClass p, .ExternalClass span, .ExternalClass font, .ExternalClass td {line-height: 100%;}
          .ExternalClass {width: 100%;}
		    body, table, td, a{-webkit-text-size-adjust: 100%; -ms-text-size-adjust: 100%;}
		    table, td{mso-table-lspace: 0pt; mso-table-rspace: 0pt;}
		    img{-ms-interpolation-mode: bicubic;}

		    img{border: 0; height: auto; line-height: 100%; outline: none; text-decoration: none;}
		    table{border-collapse: collapse !important;}
		    body{height: 100% !important; margin: 0 !important; padding: 0 !important; width: 100% !important;}

		    a[x-apple-data-detectors] {
		        color: inherit !important;
		        text-decoration: none !important;
		        font-size: inherit !important;
		        font-family: inherit !important;
		        font-weight: inherit !important;
		        line-height: inherit !important;
		    }

		    @media screen and (max-width: 525px) {

		        .wrapper {
		          width: 100% !important;
		            max-width: 100% !important;
		        }

		        .mobile-hide {
		          display: none !important;
		        }

		        .responsive-table {
		          width: 100% !important;
		        }

		        .padding {
		          padding: 10px 5% 15px 5% !important;
		        }

		        .padding-meta {
		          padding: 30px 5% 0px 5% !important;
		          text-align: center;
		        }

		        .padding-copy {
		             padding: 10px 5% 10px 5% !important;
		          text-align: center;
		        }

		        .no-padding {
		          padding: 0 !important;
		        }

		        .section-padding {
		          padding: 50px 15px 50px 15px !important;
		        }

		        .mobile-button-container {
		            margin: 0 auto;
		            width: 100% !important;
		        }

		        .mobile-button {
		            padding: 15px !important;
		            border: 0 !important;
		            font-size: 16px !important;
		            display: block !important;
		        }
				a {
				    color: #FFF;
				    text-decoration: none;
				}

		    }

		    div[style*="margin: 16px 0;"] { margin: 0 !important; }
		</style>
		</head>
		<body style="margin: 0 !important; padding: 0 !important;">
		<table border="0" cellpadding="0" cellspacing="0" width="100%">
		    <tr>
		        <td bgcolor="#ffffff" align="center">
		            <table border="0" cellpadding="0" cellspacing="0" width="100%" style="max-width: 500px;" class="wrapper">
		                <tr>
		                    <td align="center" valign="top" style="padding: 15px 0;" class="logo">
		                    </td>
		                </tr>
		            </table>
		        </td>
		    </tr>
		    <tr>
		        <td bgcolor="#D8F1FF" align="center" style="padding: 70px 15px 70px 15px;" class="section-padding">
		            <table border="0" cellpadding="0" cellspacing="0" width="100%" style="max-width: 500px;" class="responsive-table">
		                <tr>
		                    <td>
		                        <table width="100%" border="0" cellspacing="0" cellpadding="0">
		                            <tr>
		                                <td>
		                                    <table width="100%" border="0" cellspacing="0" cellpadding="0">
		                                        <tr>
		                                            <td align="center" style="font-size: 25px; font-family: Helvetica, Arial, sans-serif; color: #333333; padding-top: 30px;" class="padding">Welcome to Matcha Community !</td>
		                                        </tr>
		                                        <tr>
		                                            <td align="center" style="padding: 20px 0 0 0; font-size: 16px; line-height: 25px; font-family: Helvetica, Arial, sans-serif; color: #666666;" class="padding">You need to activate your account<br>Don't forget, be fair, be cool ! =)<br><br>Follow us on social networks !<br>Enjoy !</td>
		                                        </tr>
		                                    </table>
		                                </td>
		                            </tr>
		                            <tr>
		                                <td align="center">
		                                    <table width="100%" border="0" cellspacing="0" cellpadding="0">
		                                        <tr>
		                                            <td align="center" style="padding-top: 25px;" class="padding">
		                                                <table border="0" cellspacing="0" cellpadding="0" class="mobile-button-container">
		                                                    <tr>
		                                                        <td align="center" style="border-radius: 3px;" bgcolor="#256F9C"><a href="` + local + `/form/active_account?token=` + token + `" style="font-size: 16px; font-family: Helvetica, Arial, sans-serif; color: #ffffff; text-decoration: none; color: #ffffff; text-decoration: none; border-radius: 3px; padding: 15px 25px; border: 1px solid #256F9C; display: inline-block;" class="mobile-button">Confirm account</a></td>
		                                                    </tr>
		                                                </table>
		                                            </td>
		                                        </tr>
		                                    </table>
		                                </td>
		                            </tr>
		                        </table>
		                    </td>
		                </tr>
		            </table>
		        </td>
		    </tr>
		    <tr>
		        <td bgcolor="#ffffff" align="center" style="padding: 20px 0px;">
		            <table width="100%" border="0" cellspacing="0" cellpadding="0" align="center" style="max-width: 500px;" class="responsive-table">
		                <tr>
		                    <td align="center" style="font-size: 12px; line-height: 18px; font-family: Helvetica, Arial, sans-serif; color:#666666;">
		                        Hypertube, Lyon, France (Sillicon Valley Européenne)
		                    </td>
		                </tr>
		            </table>
		        </td>
		    </tr>
		</table>

		</body>
		</html>
`;
		const msg =
		{
			to: mail,
			from: 'community@matcha.com',
			subject: 'Confirmation mail',
			html: txt,
		};
		sgMail.setApiKey('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');
		if (sgMail.send(msg))
		{
			callback(null, 1);
		}
		else
			callback('Erreur envoie email');
	},

	forgetPasswordMail(mail, token, callback)
	{
		let txt = `<!DOCTYPE html>
		<html>
		<head>
		<title>Hypertube.com</title>
		<meta charset="utf-8">
		<meta name="viewport" content="width=device-width, initial-scale=1">
		<meta http-equiv="X-UA-Compatible" content="IE=edge" />
		<meta http-equiv="Content-Type" content="text/html charset=UTF-8" />
		<style type="text/css">
		  table {border-collapse:separate;}
		  a, a:link, {text-decoration: none; color: #00788a;}
		  a:hover {text-decoration: underline;}
		  h2,h2 a,h3,h3 a,h4,h5,h6,.t_cht {color:#000 !important;}
		  .ExternalClass p, .ExternalClass span, .ExternalClass font, .ExternalClass td {line-height: 100%;}
		  .ExternalClass {width: 100%;}
			body, table, td, a{-webkit-text-size-adjust: 100%; -ms-text-size-adjust: 100%;}
			table, td{mso-table-lspace: 0pt; mso-table-rspace: 0pt;}
			img{-ms-interpolation-mode: bicubic;}

			img{border: 0; height: auto; line-height: 100%; outline: none; text-decoration: none;}
			table{border-collapse: collapse !important;}
			body{height: 100% !important; margin: 0 !important; padding: 0 !important; width: 100% !important;}

			a[x-apple-data-detectors] {
				color: inherit !important;
				text-decoration: none !important;
				font-size: inherit !important;
				font-family: inherit !important;
				font-weight: inherit !important;
				line-height: inherit !important;
			}

			@media screen and (max-width: 525px) {

				.wrapper {
				  width: 100% !important;
					max-width: 100% !important;
				}

				.mobile-hide {
				  display: none !important;
				}

				.responsive-table {
				  width: 100% !important;
				}

				.padding {
				  padding: 10px 5% 15px 5% !important;
				}

				.padding-meta {
				  padding: 30px 5% 0px 5% !important;
				  text-align: center;
				}

				.padding-copy {
					 padding: 10px 5% 10px 5% !important;
				  text-align: center;
				}

				.no-padding {
				  padding: 0 !important;
				}

				.section-padding {
				  padding: 50px 15px 50px 15px !important;
				}

				.mobile-button-container {
					margin: 0 auto;
					width: 100% !important;
				}

				.mobile-button {
					padding: 15px !important;
					border: 0 !important;
					font-size: 16px !important;
					display: block !important;
				}
				a {
					color: #FFF;
					text-decoration: none;
				}

			}

			div[style*="margin: 16px 0;"] { margin: 0 !important; }
		</style>
		</head>
		<body style="margin: 0 !important; padding: 0 !important;">
		<table border="0" cellpadding="0" cellspacing="0" width="100%">
			<tr>
				<td bgcolor="#ffffff" align="center">
					<table border="0" cellpadding="0" cellspacing="0" width="100%" style="max-width: 500px;" class="wrapper">
						<tr>
							<td align="center" valign="top" style="padding: 15px 0;" class="logo">
							</td>
						</tr>
					</table>
				</td>
			</tr>
			<tr>
				<td bgcolor="#D8F1FF" align="center" style="padding: 70px 15px 70px 15px;" class="section-padding">
					<table border="0" cellpadding="0" cellspacing="0" width="100%" style="max-width: 500px;" class="responsive-table">
						<tr>
							<td>
								<table width="100%" border="0" cellspacing="0" cellpadding="0">
									<tr>
										<td>
											<table width="100%" border="0" cellspacing="0" cellpadding="0">
												<tr>
													<td align="center" style="font-size: 25px; font-family: Helvetica, Arial, sans-serif; color: #333333; padding-top: 30px;" class="padding">Hypertube</td>
												</tr>
												<tr>
													<td align="center" style="padding: 20px 0 0 0; font-size: 16px; line-height: 25px; font-family: Helvetica, Arial, sans-serif; color: #666666;" class="padding">You recently requested to reset your password !<br>Don't forget, be fair, be cool ! =)<br><br>Follow us on social networks !<br>Enjoy your Hypertube!</td>
												</tr>
											</table>
										</td>
									</tr>
									<tr>
										<td align="center">
											<table width="100%" border="0" cellspacing="0" cellpadding="0">
												<tr>
													<td align="center" style="padding-top: 25px;" class="padding">
														<table border="0" cellspacing="0" cellpadding="0" class="mobile-button-container">
															<tr>
																<td align="center" style="border-radius: 3px;" bgcolor="#256F9C"><a href="` + local + `/form/change-password?token=` + token + `" style="font-size: 16px; font-family: Helvetica, Arial, sans-serif; color: #ffffff; text-decoration: none; color: #ffffff; text-decoration: none; border-radius: 3px; padding: 15px 25px; border: 1px solid #256F9C; display: inline-block;" class="mobile-button">Change password</a></td>
															</tr>
														</table>
													</td>
												</tr>
											</table>
										</td>
									</tr>
								</table>
							</td>
						</tr>
					</table>
				</td>
			</tr>
			<tr>
				<td bgcolor="#ffffff" align="center" style="padding: 20px 0px;">
					<table width="100%" border="0" cellspacing="0" cellpadding="0" align="center" style="max-width: 500px;" class="responsive-table">
						<tr>
							<td align="center" style="font-size: 12px; line-height: 18px; font-family: Helvetica, Arial, sans-serif; color:#666666;">
								Hypertube, Lyon, France (Sillicon Valley Européenne)
							</td>
						</tr>
					</table>
				</td>
			</tr>
		</table>

		</body>
		</html>
`;
		const msg =
		{
			to: mail,
			from: 'community@matcha.com',
			subject: 'Reset password',
			html: txt,
		};
		sgMail.setApiKey('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');
		if (sgMail.send(msg))
		{
			callback(null, '1');
		}
		else
		{
			callback("Error sendgrid forgetpassword");
		}
	},
}

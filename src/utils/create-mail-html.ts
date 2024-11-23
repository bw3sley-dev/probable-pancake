interface CreateMailHTMLProps {
  code: string,
}

export function createMailHTML({ code }: CreateMailHTMLProps) {
  const url = "http://t21-arena-park.vercel.app/new-password", email = "t21arenapark@gmail.com";

  return `
    <!DOCTYPE html>
    <html>
    <head>
      <meta charset="UTF-8">
    </head>
    <body>
<div style="background-color:#ecfccb;">
  <div style="padding:20px 0px;background-image:url('');background-repeat:no-repeat;background-position:center bottom;background-color:#ecfccb;">

    <div style="margin:0px auto;max-width:600px">
      <table align="center" border="0" cellpadding="0" cellspacing="0" role="presentation" style="width:100%">
        <tbody>
          <tr>
            <td style="direction:ltr;font-size:0px;padding:0 20px;text-align:center">
              <div style="background:#1d1f28;background-color:#1d1f28;margin:0px auto;border-radius:8px;max-width:560px">
                <table align="center" border="0" cellpadding="0" cellspacing="0" role="presentation" style="background:#ffffff;background-color:#ffffff;width:100%;border-radius:8px">
                  <tbody>
                    <tr>
                      <td style="direction:ltr;font-size:0px;padding:0;text-align:center">
                        <div class="m_8253614536178008947mj-column-per-100" style="font-size:0px;text-align:left;direction:ltr;display:inline-block;vertical-align:top;width:100%">
                          <table border="0" cellpadding="0" cellspacing="0" role="presentation" width="100%">
                            <tbody>
                              <tr>
                                <td style="vertical-align:top;padding:25px 10px">
                                  <table border="0" cellpadding="0" cellspacing="0" role="presentation" width="100%">
                                    <tbody><tr>
                                      <td style="vertical-align:top;padding:10px 20px">
                                        <table border="0" cellpadding="0" cellspacing="0" role="presentation" width="100%">
                                          <tbody><tr>
                                            <td align="left" style="font-size:0px;padding:0;word-break:break-word">
                                              <table border="0" cellpadding="0" cellspacing="0" role="presentation" style="border-collapse:collapse;border-spacing:0px">
                                                <tbody>
                                                  <tr>
                                                    <td style="width:201.99px">
                                                      <img height="auto" style="border:0;display:block;outline:none;text-decoration:none;height:auto;width:100%;font-size:16px" width="209.99">
                                                    </td>
                                                  </tr>
                                                </tbody>
                                              </table>
                                            </td>
                                          </tr>
                                        </tbody></table>
                                      </td>
                                    </tr>
                                    <tr>
                                      <td align="left" style="font-size:0px;padding:10px 25px;word-break:break-word">
                                        <div style="font-family:Inter,Helvetica,Arial,sans-serif;font-size:16px;font-weight:bold;line-height:1.5;text-align:left;color:#121214">
                                          Hora de redefinir sua senha!</div>
                                      </td>
                                    </tr>
                                    <tr>
                                      <td align="left" style="font-size:0px;padding:10px 25px;word-break:break-word">
                                        <div style="font-family:Inter,Helvetica,Arial,sans-serif;font-size:16px;line-height:1.5;text-align:left;color:#121214">
                                          Recebemos sua solicitação para redefinir a senha da sua conta. Clique no botão abaixo para continuar o processo de recuperação:</div>
                                      </td>
                                    </tr>
                                    <tr>
                                      <td align="left" style="font-size:0px;padding:10px 25px;word-break:break-word">
                                        <a href="${url}?code=${code}" style="font-family:Inter,Helvetica,Arial,sans-serif;font-size:16px;line-height:1.5;text-align:left;color:#121214;background-color: #84cc16;padding: 8px 12px;text-decoration:none;border-radius:6px;border:1px solid #a3e635;color:#f7fee7;">
                                          <b style="font-size:14px">Recuperar senha</b>
                                        </a>
                                      </td>
                                    </tr>
                                    <tr>
                                      <td align="left" style="font-size:0px;padding:10px 25px;word-break:break-word">
                                        <div style="font-family:Inter,Helvetica,Arial,sans-serif;font-size:16px;line-height:1.5;text-align:left;color:#121214">
                                          Por favor, clique no botão abaixo para ser redirecionado ao nosso site e concluir a redefinição de sua senha. O link é válido por 2 dias, então não demore para garantir a segurança da sua conta.</div>
                                      </td>
                                    </tr>
                                    <tr>
                                      <td align="left" style="font-size:0px;padding:10px 25px;word-break:break-word">
                                        <div style="font-family:Inter,Helvetica,Arial,sans-serif;font-size:16px;line-height:1.5;text-align:left;color:#121214">
                                          Se você não solicitou a redefinição de senha, ignore este e-mail. Nenhuma alteração será feita em sua conta. Para qualquer dúvida ou necessidade de assistência adicional, entre em contato conosco pelo e-mail <a href="mailto:${email}" target="_blank">${email}</a>.</div>
                                      </td>
                                    </tr>

                                    <tr>
                                      <td align="left" style="font-size:0px;padding:10px 25px;word-break:break-word">
                                        <div style="font-family:Inter,Helvetica,Arial,sans-serif;font-size:16px;line-height:1.5;text-align:left;color:#121214">
                                          Um abraço, <br>Equipe T21 Arena Park</div>
                                      </td>
                                    </tr>
                                  </tbody></table>
                                </td>
                              </tr>
                            </tbody>
                          </table>
                        </div>
                      </td>
                    </tr>
                  </tbody>
                </table>
              </div>
            </td>
          </tr>
        </tbody>
      </table>
      <div class="yj6qo"></div>
      <div class="adL"></div>
    </div>
    <div class="adL"></div>
  </div>
  <div class="adL"></div>
</div>     
    </body>
    </html>
    `
}
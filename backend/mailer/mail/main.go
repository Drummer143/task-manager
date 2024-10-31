package mail

import (
	"crypto/tls"
	"html/template"
	"os"
	"strings"

	"gopkg.in/gomail.v2"
)

type Mailer struct {
	dialer *gomail.Dialer
}

func New() *Mailer {
	senderAddress := os.Getenv("EMAIL_ADDRESS")
	senderPassword := os.Getenv("EMAIL_PASSWORD")

	dialer := gomail.NewDialer("smtp.gmail.com", 587, senderAddress, senderPassword)
	dialer.TLSConfig = &tls.Config{InsecureSkipVerify: true}

	return &Mailer{
		dialer: dialer,
	}
}

// func (m *Mailer) Send(message ...*gomail.Message) error {
// 	return m.dialer.DialAndSend(message...)
// }

func (m *Mailer) SendEmailConfirmationMessage(to string, token string) error {
	url := os.Getenv("CONFIRM_EMAIL_URL") + token

	tmpl, err := template.ParseFiles("mail/templates/emailConfirmation.html")

	if err != nil {
		return err
	}

	var body strings.Builder

	if err := tmpl.Execute(&body, map[string]string{"ConfirmationLink": url}); err != nil {
		return err
	}

	message := gomail.NewMessage()

	message.SetHeader("From", m.dialer.Username)
	message.SetHeader("To", "<"+to+">")
	message.SetHeader("Subject", "Confirm your email address")

	message.SetBody("text/html", body.String())

	return m.dialer.DialAndSend(message)
}

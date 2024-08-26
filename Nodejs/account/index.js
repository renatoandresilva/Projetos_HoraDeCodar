// Modelos externos
const inquirer = require('inquirer');
const chalk = require('chalk');

// Modulos interno
const fs = require('fs');

operation();

function operation() {
  inquirer.prompt([
    {
      type: 'list',
      name: 'action',
      message: 'O que você deseja fazre?',
      choices: ['Criar conta','Consultar saldo','Depositar','Sacar','Sair'],
    }, 
  ]).then(res => {
    const action = res['action'];
  
    switch (action) {
      case 'Criar conta':
        createAccount();
        break;
      case 'Depositar':
        deposit();
        break;
      case 'Consultar saldo':
        getAccountBalance();
        break;
      case 'Sacar': 
        Withdraw();
        break;
      default:
        console.log(chalk.bgBlue.black('Obrigado por usar o account!'))
        process.exit();
      
    }

  }).catch(err => console.log(err));
}

// Create an  account
function createAccount() {
  console.log(chalk.bgGreen.yellow('Paraéns por escolher nosso banco!'));
  console.log(chalk.green('Defina as opções da sua conta a seguir.'));

  buildAccount();
}

function buildAccount() {
  inquirer.prompt([{
    name: 'accountName',
    message: 'Digite um nome para sua conta: '
  }]).then(res =>  {
    const accountName = res['accountName'];
    console.info(accountName); 
    
    if (!fs.existsSync('accounts')) {
      fs.mkdirSync('accounts');
    }

    if (fs.existsSync(`accounts/${accountName}.json`)) {
      console.log(chalk.bgRed.black('Esta conta já existe. Escolha outro nome.'));
      buildAccount();
      return
    }

    fs.writeFileSync(`accounts/${accountName}.json`, '{"Balance": 0}', function (err) {
      console.log(err);
    })

    console.log('Parabéns a sua conta foi criada com sucesso!');

    operation();
  })
  .catch(err => console.log(err))
}

// Add cash to user account
function deposit() {
  inquirer.prompt([{
    name: 'accountName',
    message: 'Qual o nome da conta?'
  }]).then(res => {
    const accountName = res['accountName'];

    //account existence 
    if (!checkAccount(accountName)) {
      return deposit();
    }

    inquirer.prompt([{
      name: 'amount',
      message: 'Quanto você deseja depositar?'
    }])
    .then(res => {
      const amount = res['amount'];

      // Add an amount
      addAmount(accountName, amount);
      operation();
    }).catch(err => console.log(err));

  }).catch(err => console.log(chalk.bgRed.black(err)));
}
// Show account balance
function getAccountBalance() {
  inquirer.prompt([{
    name: 'accountName',
    message: 'Qual o nome da sua conta?'
  }])
  .then(res => {
    const accountName = res['accountName'];

    if (!checkAccount(accountName)) {
      return getAccountBalance();
    }

    const accountData = getAccount(accountName);

    console.log(chalk.green(
      `Saldo disponível: ${accountData.Balance}`
    ));

    operation();
  }).catch(err => console.log(err));
}

// Take money from user account
function Withdraw() {
  inquirer.prompt([{
    name: 'accountName',
    message: 'Qual o nome da sua conta?'
  }])
  .then(res => {
    const accountName = res['accountName'];

    if (!checkAccount(accountName)) {
      return Withdraw();
    }

    inquirer.prompt([{
      name: 'amount',
      message: 'Qual valor deseja retirar?'
    }])
    .then(res => {
      const amount = res['amount'];

      removeAmount(accountName, amount);
    }).catch(err => console.log(err))

  }).catch(err => console.log(err))
}

//Functions 
const checkAccount = (accountName) => { 
  if(!fs.existsSync(`accounts/${accountName}.json`)) {
    console.log(chalk.bgRed.black('Conta inexisnte. Tente outra vez.'));
    return false;
  };
  return true;
}

const addAmount = (accountName, amount) => {
  const accountData = getAccount(accountName);

  if (!amount || isNaN(amount)) {
    console.log(chalk.bgRed.black('Ocorreu um erro! tente novamente mais tarde.'));
    return deposit();
  }

  accountData.Balance = parseFloat(amount) + parseFloat(accountData.Balance);


  fs.writeFileSync(`accounts/${accountName}.json`, JSON.stringify(accountData), function(err) {
    console.log(err);
  });

  console.log(chalk.green(`Depósito no valor de R$${amount} realizado com sucesso.`));
};

const getAccount = (accountName) => {
  const accountJSON = fs.readFileSync(`accounts/${accountName}.json`, {
    encoding: 'utf-8',
    flag: 'r',
  })

  return JSON.parse(accountJSON);
};

const removeAmount = (accountName, amount) => {
  const accountData = getAccount(accountName);
  
  if (!amount) {
    console.log(chalk.bgRedBright.black('Ocorreu um error tente novamento mais tarde.'));
    return Withdraw();
  }

  if (accountData < amount) {
    console.log(chalk.bgRedBright.black('Saldo insuficiente.'));
    return Withdraw();
  }

  accountData.Balance = parseFloat(accountData.Balance) - parseFloat(amount);
 
  fs.writeFileSync(`accounts/${accountName}.json`, JSON.stringify(accountData), function(err) {
    console.log(err); 
  })

  console.log(chalk.bgGreen.black(`Saque no valor de R$${amount} realizado com sucesso.`));
  operation();
}; 